import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const hasWebsite = url.searchParams.get('has_website') === 'true';
    const hasInstagram = url.searchParams.get('has_instagram') === 'true';
    const needsEnrichment = url.searchParams.get('needs_enrichment') === 'true';

    // Build query
    let query = supabase
      .from('clubs')
      .select('id, club_name, website, instagram_handle, insta_url, city, country, suburb, address, email, phone, business_description, logo, insta_bio, insta_followers, avg_likes, avg_comments, avg_video_views, ownership_group, number_of_courts, number_of_clubs, contact_name')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (hasWebsite) {
      query = query.not('website', 'is', null);
    }
    if (hasInstagram) {
      query = query.not('instagram_handle', 'is', null);
    }
    if (needsEnrichment) {
      // Clubs that don't have enriched data yet
      query = query.is('business_description', null);
    }

    const { data: clubs, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch clubs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Returning ${clubs?.length || 0} clubs`);

    return new Response(
      JSON.stringify({ 
        clubs: clubs || [],
        pagination: {
          limit,
          offset,
          returned: clubs?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in api-get-clubs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
