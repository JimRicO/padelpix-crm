

# Daily WhatsApp Agenda Reminder

Send each user a WhatsApp message every day at **12:30 UTC** listing their agenda items for that day (manual events, system pipeline events, due tasks, and industry events).

## How it works

```text
12:30 UTC daily (pg_cron)
        │
        ▼
send-daily-agenda (edge function)
        │
        ├─ For each user with whatsapp_number set in profile:
        │     1. Query agenda_events where event_date = today
        │     2. Query tasks where due_date = today AND status != completed
        │     3. Query events (industry) overlapping today
        │     4. Format into a WhatsApp message
        │     5. POST to Whapi.Cloud /messages/text
        │
        ▼
   WhatsApp delivered
```

## Changes

### 1. Database
- Add `whatsapp_number` (text, nullable) to `profiles` table — E.164 format, e.g. `+34612345678`.
- Add `whatsapp_reminders_enabled` (boolean, default `true`) to `profiles` so users can opt out.

### 2. Profile UI
- Add a small "WhatsApp Reminders" section in the Header user menu (or a new `/settings` page) where the user can:
  - Enter / edit their WhatsApp number (with E.164 validation hint).
  - Toggle the daily reminder on/off.
  - Send a "Test message" button that triggers the edge function for just their account immediately.

### 3. Edge function: `send-daily-agenda`
- Deno function in `supabase/functions/send-daily-agenda/index.ts`.
- Two modes:
  - **Cron mode** (no body / `{ mode: "cron" }`): loops over every profile with a number + reminders enabled, builds and sends each message. Auth via internal cron secret header.
  - **Test mode** (`{ mode: "test", user_id }`): sends just for the specified user (called from the "Test message" button with the user's JWT).
- Uses Supabase service role to read `profiles`, `agenda_events`, `tasks`, `events`, `clubs`.
- Calls Whapi.Cloud:
  - `POST https://gate.whapi.cloud/messages/text`
  - `Authorization: Bearer ${WHAPI_TOKEN}`
  - Body: `{ to: "<number without +>", body: "<formatted agenda>" }`
- Skips users with zero items (no spam).
- Logs success/failure per user to `console` for debugging.

### 4. Message format (example)
```
🗓 Your PadelPix CRM agenda — Tue 22 Apr

Events
• 09:00  Call with Club Padel Madrid
• 14:00  Demo — Ace Padel Group

Tasks due today
• Follow up Mike Lumb (Padel House)
• DM — Iberica Padel

Industry events
• Padel Expo Madrid (Day 2/3)
```

### 5. Daily schedule (pg_cron + pg_net)
- Enable `pg_cron` and `pg_net` extensions if not already.
- Schedule a job at `30 12 * * *` UTC that POSTs to the edge function URL with the project anon key + `{ "mode": "cron" }`.
- Cron SQL is run via the data tool (not migrations) since it embeds the project URL.

### 6. Secrets
- Requires a new secret: **`WHAPI_TOKEN`** (Whapi.Cloud bearer token — same provider already used in the PadelStudio project).
- I will request it via `add_secret` once you approve the plan.

## Files

- `supabase/migrations/<timestamp>_profile_whatsapp.sql` — add columns to `profiles`.
- `supabase/functions/send-daily-agenda/index.ts` — new edge function.
- `supabase/config.toml` — add `[functions.send-daily-agenda] verify_jwt = false` (cron call has no JWT; we validate in code via internal secret).
- `src/components/settings/WhatsAppReminderSettings.tsx` — new UI panel.
- `src/components/layout/Header.tsx` — add link / dropdown item to open settings.
- `src/hooks/useProfile.ts` — new hook for read/update of profile WhatsApp fields.
- Cron job inserted via SQL once the function is deployed.

## Open questions / non-goals

- Phone numbers are stored in `profiles` per logged-in user only; no per-org broadcast.
- No retry logic on Whapi failures in v1 — failures are logged.
- No timezone-per-user in v1 (all reminders fire at 12:30 UTC, as you specified).

