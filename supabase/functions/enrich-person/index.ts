import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PEOPLE_API_BASE = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1";

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

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'create';

    // Handle different actions
    switch (action) {
      case 'create': {
        // Create a new research job
        const body = await req.json();
        const { person_name, context } = body;

        if (!person_name) {
          return new Response(
            JSON.stringify({ success: false, error: 'person_name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Creating research job for: ${person_name}, context: ${context || 'none'}`);

        const response = await fetch(`${PEOPLE_API_BASE}/api-create-people-job`, {
          method: 'POST',
          headers: {
            'x-api-key': CRM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            person_name,
            context: context || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('People API error:', data);
          return new Response(
            JSON.stringify({ success: false, error: data.error || 'Failed to create research job' }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Research job created:', data);

        return new Response(
          JSON.stringify({ success: true, ...data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        // Check job status
        const jobId = url.searchParams.get('job_id');
        
        if (!jobId) {
          return new Response(
            JSON.stringify({ success: false, error: 'job_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Checking status for job: ${jobId}`);

        const response = await fetch(`${PEOPLE_API_BASE}/api-get-people-status?job_id=${jobId}`, {
          method: 'GET',
          headers: {
            'x-api-key': CRM_API_KEY,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Status API error:', data);
          return new Response(
            JSON.stringify({ success: false, error: data.error || 'Failed to get status' }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Status data:', data);

        return new Response(
          JSON.stringify({ success: true, ...data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'results': {
        // Fetch enriched results
        const jobId = url.searchParams.get('job_id');
        
        if (!jobId) {
          return new Response(
            JSON.stringify({ success: false, error: 'job_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Fetching results for job: ${jobId}`);

        const response = await fetch(`${PEOPLE_API_BASE}/api-get-people?job_id=${jobId}`, {
          method: 'GET',
          headers: {
            'x-api-key': CRM_API_KEY,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Results API error:', data);
          return new Response(
            JSON.stringify({ success: false, error: data.error || 'Failed to get results' }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Results fetched:', data);

        return new Response(
          JSON.stringify({ success: true, ...data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Error in enrich-person:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
