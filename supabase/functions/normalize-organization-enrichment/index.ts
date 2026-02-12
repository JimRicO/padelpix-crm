import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Organization schema - maps enrichment API data to ownership_groups columns
const ORGANIZATION_SCHEMA = {
  // Core identity
  name: 'string - Name of the organization/group',
  website: 'string - Website URL',
  address: 'string - Full address',
  country: 'string - Country name',
  contact_name: 'string - Primary contact person name',
  contact_email: 'string - Contact email address',
  contact_phone: 'string - Contact phone number',
  
  // Description
  description: 'string - Description of the organization',
  
  // Social media
  instagram_handle: 'string - Instagram username (without @)',
  instagram_followers: 'number - Instagram follower count',
  instagram_bio: 'string - Instagram bio text',
  
  // Branding
  logo_url: 'string - Logo image URL (from logo_storage_url)',
  color_palette: 'object - {primary, secondary, accent, background} hex colors',
  fonts: 'object - {primary, heading} font family names',
  attitude: 'string - Brand personality, voice, values',
  aesthetics: 'string - Visual style assessment',
  
  // Research / Perplexity data
  perplexity_description: 'string - Factual description from web research',
  founder_info: 'string - Founder background and origin story',
  founding_year: 'string - Year established (e.g., "2015")',
  recent_activities: 'array of objects - Recent events [{title, date, description}]',
  perplexity_citations: 'array of strings - Source URLs from research',
  
  // People - FULL STRUCTURED DATA
  key_people: 'array of objects - Key people with full details [{name, role, context}]',
  key_individuals: 'array of strings - Key people names only (for backwards compatibility)',
  
  // Notes
  notes: 'string - Additional notes or unmapped data',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { enrichmentData, organizationName } = await req.json();

    if (!enrichmentData) {
      throw new Error('No enrichment data provided');
    }

    console.log(`Normalizing enrichment data for organization: ${organizationName || 'Unknown'}`);
    console.log('Raw enrichment data keys:', Object.keys(enrichmentData));

    const systemPrompt = `You are an intelligent data mapper for a CRM system. Your job is to map enrichment API results to an organization database record.

CRITICAL INSTRUCTIONS:
1. Map ALL incoming data to the appropriate schema fields - do NOT ignore any data
2. If a field doesn't have an exact match, find the closest semantic match
3. For completely new fields with no match, add them to a "notes" field as structured text
4. Preserve ALL information - nothing should be lost
5. Extract information ONLY for the organization named "${organizationName || 'the target organization'}". If the data mentions multiple entities, ONLY return data for this organization.

TARGET ORGANIZATION SCHEMA:
${JSON.stringify(ORGANIZATION_SCHEMA, null, 2)}

CRITICAL MAPPING RULES:

1. KEY_PEOPLE FIELD (MOST IMPORTANT):
   - The API may return "key_people" as an array of objects: [{name, role, context}, ...]
   - Store the FULL ARRAY in "key_people" field - preserve name, role, AND context
   - ALSO extract just the names into "key_individuals" for backwards compatibility
   - If key_people data comes as "key_individuals" (names only), still populate both fields
   - Example input: key_people: [{name: "John Smith", role: "CEO", context: "Founded in 2015"}]
   - Output: 
     - key_people: [{name: "John Smith", role: "CEO", context: "Founded in 2015"}]
     - key_individuals: ["John Smith"]
   - DO NOT lose the role or context data!

2. Other field mappings:
   - "logo_storage_url" → "logo_url"
   - "club_name" or "organization_name" → "name" (but DO NOT include in output - we handle this separately)
   - "email" → "contact_email"
   - "phone" → "contact_phone" (MUST be a real phone number like "+27 12 345 6789" - NEVER map dates, timestamps, or IDs to this field. If the value looks like a date or timestamp, set contact_phone to null)
   - "website_url" → "website"
   - Color/palette data → "color_palette" object with {primary, secondary, accent, background}
   - Font data → "fonts" object with {primary, heading}
   - Research/web data → appropriate perplexity fields
   - Dates should be ISO format or simple strings
   - Numbers should be actual numbers, not strings
   - Arrays should be actual arrays, not comma-separated strings
   - Remove @ from Instagram handles
   - Add https:// to URLs if missing
   - "instagram_handle" → "instagram_handle" (remove @ prefix if present)
   - "instagram_followers" or "insta_followers" → "instagram_followers" (must be a number)
   - "instagram_bio" or "insta_bio" → "instagram_bio"

Respond with ONLY valid JSON - no markdown, no explanation. The JSON should contain only the mapped fields that have values.`;

    const userPrompt = `Map this enrichment API response to the organization schema:

${JSON.stringify(enrichmentData, null, 2)}

Return ONLY the mapped JSON object with field names matching the schema. Include ALL data - nothing should be lost.`;

    console.log('Calling Claude Sonnet for intelligent organization mapping...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const anthropicResponse = await response.json();
    console.log('Claude Sonnet response received for organization');

    const textContent = anthropicResponse.content?.find((c: { type: string }) => c.type === 'text');
    if (!textContent?.text) {
      throw new Error('No text content in response');
    }

    let mappedData;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      mappedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse response:', textContent.text);
      throw new Error('Failed to parse AI response');
    }

    // Post-extraction verification: ensure key_people data is for the right entity
    if (mappedData.key_people && Array.isArray(mappedData.key_people)) {
      console.log(`Extracted ${mappedData.key_people.length} key people for ${organizationName}`);
      
      // Derive key_individuals if not present
      if (!mappedData.key_individuals) {
        mappedData.key_individuals = mappedData.key_people
          .map((p: { name?: string }) => p?.name)
          .filter(Boolean);
      }
    }

    console.log('Mapped organization fields:', Object.keys(mappedData));

    return new Response(
      JSON.stringify({
        success: true,
        mappedData,
        originalKeys: Object.keys(enrichmentData),
        mappedKeys: Object.keys(mappedData),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Normalize organization enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
