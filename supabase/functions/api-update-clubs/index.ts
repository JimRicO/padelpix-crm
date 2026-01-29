import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Fields that can be updated via API
const ALLOWED_FIELDS = [
  'business_description',
  'logo',
  'phone',
  'email',
  'address',
  'suburb',
  'city',
  'country',
  'website',
  'instagram_handle',
  'insta_url',
  'insta_bio',
  'insta_followers',
  'avg_likes',
  'avg_comments',
  'avg_video_views',
  'top_hashtags',
  'key_individuals',
  'facebook',
  'twitter',
  'linkedin',
  'google_maps_url',
  'contact_name',
  'number_of_courts',
  'number_of_clubs',
  'coaches',
  'notes',
];

interface ClubUpdate {
  id: string;
  [key: string]: unknown;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate API key from header
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('CRM_API_KEY');
    
    if (!expectedApiKey) {
      console.error('CRM_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { clubs } = body as { clubs: ClubUpdate[] };

    if (!clubs || !Array.isArray(clubs)) {
      return new Response(
        JSON.stringify({ error: 'clubs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const club of clubs) {
      if (!club.id) {
        results.push({ id: 'unknown', success: false, error: 'Missing club id' });
        continue;
      }

      // Filter to only allowed fields
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(club)) {
        if (key !== 'id' && ALLOWED_FIELDS.includes(key)) {
          updates[key] = value;
        }
      }

      if (Object.keys(updates).length === 0) {
        results.push({ id: club.id, success: false, error: 'No valid fields to update' });
        continue;
      }

      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', club.id);

      if (error) {
        console.error(`Error updating club ${club.id}:`, error);
        results.push({ id: club.id, success: false, error: error.message });
      } else {
        results.push({ id: club.id, success: true });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Updated ${successCount} clubs, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Updated ${successCount} clubs`,
        results,
        summary: { success: successCount, failed: failCount }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in api-update-clubs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
