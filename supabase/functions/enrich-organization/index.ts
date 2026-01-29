import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ENRICHMENT_API_URL = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1/api-create-enrichment-job";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY');
    if (!CRM_API_KEY) {
      throw new Error('CRM_API_KEY is not configured');
    }

    const body = await req.json();
    const { organization_name, website_url, instagram_handle } = body;

    if (!organization_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'organization_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Submitting enrichment job for: ${organization_name}`);

    // Build the payload for the enrichment platform
    const enrichmentPayload: Record<string, string> = {
      club_name: organization_name,
    };
    
    if (website_url) {
      enrichmentPayload.website_url = website_url;
    }
    
    if (instagram_handle) {
      enrichmentPayload.instagram_handle = instagram_handle;
    }

    // Call the enrichment platform
    const response = await fetch(ENRICHMENT_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': CRM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichmentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Enrichment API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Enrichment request failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Enrichment job created:', data);

    return new Response(
      JSON.stringify({ success: true, ...data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in enrich-organization:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
