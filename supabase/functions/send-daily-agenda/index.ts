import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";

interface AgendaEventRow {
  id: string;
  event_date: string;
  end_date: string | null;
  event_time: string | null;
  title: string;
  event_type: string;
  description: string | null;
  club_id: string | null;
}

interface TaskRow {
  id: string;
  title: string;
  club_id: string | null;
  description: string | null;
}

interface IndustryEventRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  notes: string | null;
}

interface ClubRow {
  id: string;
  club_name: string;
  created_by: string;
}

function todayInUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(t: string | null): string {
  if (!t) return "      ";
  return t.slice(0, 5);
}

function formatHumanDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

async function buildAgendaForUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string,
): Promise<string | null> {
  const { data: agenda } = await supabase
    .from("agenda_events")
    .select("id,event_date,end_date,event_time,title,event_type,description,club_id")
    .eq("created_by", userId)
    .lte("event_date", today)
    .or(`end_date.gte.${today},end_date.is.null`)
    .order("event_time", { ascending: true, nullsFirst: false });

  // Tasks: due today and not completed. Tasks belong to clubs (created_by on clubs).
  const { data: userClubs } = await supabase
    .from("clubs")
    .select("id,club_name,created_by")
    .eq("created_by", userId);

  const clubIds = (userClubs ?? []).map((c: ClubRow) => c.id);
  const clubNameById = new Map<string, string>(
    (userClubs ?? []).map((c: ClubRow) => [c.id, c.club_name]),
  );

  let tasks: TaskRow[] = [];
  if (clubIds.length > 0) {
    const startOfDay = `${today}T00:00:00Z`;
    const endOfDay = `${today}T23:59:59Z`;
    const { data: taskData } = await supabase
      .from("tasks")
      .select("id,title,club_id,status,due_date,description")
      .in("club_id", clubIds)
      .neq("status", "completed")
      .gte("due_date", startOfDay)
      .lte("due_date", endOfDay);
    tasks = (taskData ?? []) as TaskRow[];
  }

  const { data: industry } = await supabase
    .from("events")
    .select("id,name,start_date,end_date,description,notes")
    .eq("created_by", userId)
    .lte("start_date", today)
    .or(`end_date.gte.${today},end_date.is.null`);

  const agendaItems = ((agenda ?? []) as AgendaEventRow[]).filter((e) => {
    if (e.end_date) return e.event_date <= today && e.end_date >= today;
    return e.event_date === today;
  });
  const industryItems = (industry ?? []).filter((e: IndustryEventRow) => {
    if (e.end_date) return e.start_date <= today && e.end_date >= today;
    return e.start_date === today;
  }) as IndustryEventRow[];

  if (
    agendaItems.length === 0 &&
    tasks.length === 0 &&
    industryItems.length === 0
  ) {
    return null;
  }

  const lines: string[] = [];
  lines.push(`🗓 Your PadelPix CRM agenda — ${formatHumanDate(today)}`);

  if (agendaItems.length > 0) {
    lines.push("");
    lines.push("*Events*");
    for (const ev of agendaItems) {
      const club = ev.club_id ? clubNameById.get(ev.club_id) : null;
      lines.push(`• ${formatTime(ev.event_time)}  *${ev.title}*${club ? ` — ${club}` : ""}`);
      if (ev.description?.trim()) {
        lines.push(`    📝 ${ev.description.trim()}`);
      }
    }
  }

  if (tasks.length > 0) {
    lines.push("");
    lines.push("*Tasks due today*");
    for (const t of tasks) {
      const club = t.club_id ? clubNameById.get(t.club_id) : null;
      lines.push(`• *${t.title}*${club ? ` — ${club}` : ""}`);
      if (t.description?.trim()) {
        lines.push(`    📝 ${t.description.trim()}`);
      }
    }
  }

  if (industryItems.length > 0) {
    lines.push("");
    lines.push("*Industry events*");
    for (const e of industryItems) {
      lines.push(`• *${e.name}*`);
      const note = e.notes?.trim() || e.description?.trim();
      if (note) {
        lines.push(`    📝 ${note}`);
      }
    }
  }

  return lines.join("\n");
}

async function sendWhatsApp(
  token: string,
  rawNumber: string,
  body: string,
): Promise<{ ok: boolean; status: number; response: string }> {
  const to = rawNumber.replace(/[^0-9]/g, "");
  const res = await fetch(WHAPI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, body }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, response: text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const WHAPI_TOKEN = Deno.env.get("WHAPI_TOKEN");

  if (!WHAPI_TOKEN) {
    return new Response(
      JSON.stringify({ error: "WHAPI_TOKEN is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: { mode?: string; user_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const mode = body.mode ?? "cron";

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const today = todayInUtc();

  // Test mode: only the requesting user
  if (mode === "test") {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { data: profile } = await admin
      .from("profiles")
      .select("id,whatsapp_number,whatsapp_reminders_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.whatsapp_number) {
      return new Response(
        JSON.stringify({ error: "No WhatsApp number set on profile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const message = await buildAgendaForUser(admin, userId, today);
    const finalMessage =
      message ??
      `🗓 Your PadelPix CRM agenda — ${formatHumanDate(today)}\n\nNothing scheduled for today. ✨`;

    const result = await sendWhatsApp(WHAPI_TOKEN, profile.whatsapp_number, finalMessage);
    console.log("test-send", { userId, ok: result.ok, status: result.status });
    return new Response(
      JSON.stringify({ sent: result.ok, status: result.status, response: result.response }),
      {
        status: result.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Cron mode: every enabled profile with a number
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("id,whatsapp_number,whatsapp_reminders_enabled")
    .not("whatsapp_number", "is", null)
    .eq("whatsapp_reminders_enabled", true);

  if (profilesErr) {
    console.error("profiles fetch error", profilesErr);
    return new Response(JSON.stringify({ error: profilesErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ user_id: string; sent: boolean; skipped?: boolean; error?: string }> = [];
  for (const p of profiles ?? []) {
    try {
      const message = await buildAgendaForUser(admin, p.id, today);
      if (!message) {
        results.push({ user_id: p.id, sent: false, skipped: true });
        continue;
      }
      const r = await sendWhatsApp(WHAPI_TOKEN, p.whatsapp_number as string, message);
      results.push({ user_id: p.id, sent: r.ok, error: r.ok ? undefined : r.response });
      console.log("cron-send", { user_id: p.id, ok: r.ok, status: r.status });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("cron-send error", { user_id: p.id, error: msg });
      results.push({ user_id: p.id, sent: false, error: msg });
    }
  }

  return new Response(JSON.stringify({ today, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});