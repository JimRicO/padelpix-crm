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

    const prompt = `GEOGRAPHIC HIERARCHY (you must follow):
- Suburb/Neighborhood → CITY → Province
- Return BOTH suburb and city levels

CRITICAL MAPPING RULES FOR JOHANNESBURG METRO:
All these suburbs map to "Johannesburg" as the city:

Core Johannesburg suburbs:
- Dunkeld, Sandton, Rosebank, Fourways, Bryanston, Midrand, Morningside, Greenside, Auckland Park, Honeydew, Illovo, Norwood, Rivonia, Houghton, Lower Houghton
- Sandhurst, Magaliessig, Sunninghill, Bruma, Paulshof, Birnam, Birdhaven, Emmarentia, Lonehill, Linksfield, Ormonde, Modderfontein, Turfontein
- Lenasia, Glenvista, Bordeaux, Tres Jolie AH, Randpark

East Rand suburbs (also Johannesburg):
- Benoni, Rynfield, Boksburg, Germiston, Bedfordview, Avion Park, Kempton Park, Parkrand, Edenvale, Liefde en Vrede

West Rand suburbs (also Johannesburg):
- Randburg, Roodepoort, Ruimsig, Alberton, Randhart

Specific estates/clubs (treat location name as suburb):
- Thaba Eco Estate → Johannesburg
- Steyn City → Johannesburg
- Modderfontein Golf Club → Johannesburg (suburb: Modderfontein)

Cape Town suburbs (Western Cape):
- Claremont, Constantia, Sea Point, Camps Bay, Green Point, Stellenbosch, Paarl

Durban suburbs (KwaZulu-Natal):
- Umhlanga, Ballito, Durban North, Westville

Pretoria/Tshwane suburbs (Gauteng):
- Centurion, Hatfield, Menlyn, Silverton

EXTRACTION RULES:
1. SUBURB: Extract the most specific neighborhood/suburb/estate name
   - If address has estate name (e.g., "Thaba Eco Estate"), use that as suburb
   - If multiple suburbs listed (e.g., "Dunkeld, Randburg"), use the FIRST/most specific
   - If only "Johannesburg, South Africa" → suburb is null

2. CITY: Always map suburb to parent city using rules above
   - Randburg, Roodepoort, Benoni, Boksburg, etc. → "Johannesburg" (NOT the suburb name)

3. IGNORE completely:
   - Province names: Gauteng, Western Cape, KwaZulu-Natal
   - Postal codes: 2056, 2191, 2194, etc.
   - Descriptive terms: "German Country Club", "Country Club", "Shopping Centre", "Golf Club"
   - Street addresses: "131 Holkam Road", "49 Eastwood Rd"
   - Directional terms: "North", "ext 2"

4. DEFAULT: Country is always "South Africa"

EXAMPLES:
Input: "49 Eastwood Rd, Dunkeld, Randburg"
Output: {"suburb": "Dunkeld", "city": "Johannesburg", "country": "South Africa"}

Input: "131 Holkam Road, Fourways German Country Club, Gauteng, 2056"
Output: {"suburb": "Fourways", "city": "Johannesburg", "country": "South Africa"}

Input: "Thaba Eco Estate, Johannesburg, South Africa"
Output: {"suburb": "Thaba Eco Estate", "city": "Johannesburg", "country": "South Africa"}

Addresses:
${addresses.map((addr: string, i: number) => `${i + 1}. ${addr}`).join('\n')}

Return ONLY valid JSON array with no explanation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          { role: 'system', content: 'You are a South African geography expert. Extract the SUBURB and parent CITY from addresses. Return BOTH suburb and city levels. Always respond with valid JSON only.' },
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
