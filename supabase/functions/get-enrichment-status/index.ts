import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ENRICHMENT_STATUS_URL = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1/api-get-enrichment-status";
const ENRICHMENT_RESULTS_URL = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1/api-get-clubs";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY');
    if (!CRM_API_KEY) {
      throw new Error('CRM_API_KEY is not configured');
    }

    // Accept job_id from body or query params
    let jobId: string | null = null;
    
    const url = new URL(req.url);
    jobId = url.searchParams.get('job_id');
    
    if (!jobId && req.method === 'POST') {
      try {
        const body = await req.json();
        jobId = body.job_id;
      } catch {
        // No body or invalid JSON
      }
    }

    if (!jobId) {
      return new Response(
        JSON.stringify({ success: false, error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking enrichment status for job: ${jobId}`);

    // Get job status
    const statusResponse = await fetch(`${ENRICHMENT_STATUS_URL}?job_id=${jobId}`, {
      method: 'GET',
      headers: {
        'x-api-key': CRM_API_KEY,
      },
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      console.error('Status API error:', statusData);
      return new Response(
        JSON.stringify({ success: false, error: statusData.error || 'Failed to get status' }),
        { status: statusResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Status data:', statusData);

    // If completed, fetch the results
    if (statusData.is_complete || statusData.status === 'completed') {
      console.log(`Job ${jobId} complete, fetching results...`);
      
      const resultsResponse = await fetch(`${ENRICHMENT_RESULTS_URL}?job_id=${jobId}`, {
        method: 'GET',
        headers: {
          'x-api-key': CRM_API_KEY,
        },
      });

      const resultsData = await resultsResponse.json();

      if (!resultsResponse.ok) {
        console.error('Results API error:', resultsData);
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: statusData,
            results: null,
            error: 'Failed to fetch results'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Results fetched:', resultsData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: statusData,
          results: resultsData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not yet complete
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: statusData,
        results: null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in get-enrichment-status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
