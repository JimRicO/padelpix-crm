import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { addresses } = await req.json();
    
    if (!addresses || !Array.isArray(addresses)) {
      return new Response(
        JSON.stringify({ error: 'addresses array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Extract the suburb, city, and country from each South African address.

CRITICAL RULES:
1. "city" MUST be the major metropolitan city, NEVER a suburb or province:
   - Valid cities: Johannesburg, Cape Town, Durban, Pretoria, Port Elizabeth, Bloemfontein, East London, Polokwane, Nelspruit, Kimberley
   - Gauteng, Western Cape, KwaZulu-Natal, etc. are PROVINCES, not cities - never return these as city
   - Randburg, Sandton, Fourways, Dunkeld, Rosebank, Bryanston, Midrand are SUBURBS of Johannesburg
   - Claremont, Constantia, Sea Point are SUBURBS of Cape Town
   - Umhlanga, Ballito are SUBURBS of Durban
   
2. "suburb" should be the specific area/neighborhood from the address

3. Default country to "South Africa"

Addresses:
${addresses.map((addr: string, i: number) => `${i + 1}. ${addr}`).join('\n')}

Return ONLY valid JSON array with "suburb", "city", "country" fields. Example:
[{"suburb": "Sandton", "city": "Johannesburg", "country": "South Africa"}]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          { role: 'system', content: 'You are a South African geography expert. Extract city and country from addresses, mapping suburbs to their parent cities. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON from the response
    let locations;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      locations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return empty locations as fallback
      locations = addresses.map(() => ({ city: null, country: null }));
    }

    console.log('Extracted locations:', locations);

    return new Response(
      JSON.stringify({ locations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-location:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
