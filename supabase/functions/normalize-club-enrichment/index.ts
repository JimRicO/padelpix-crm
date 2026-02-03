import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete club schema - Sonnet will map ANY incoming data to these fields
const CLUB_SCHEMA = {
  // Core identity
  club_name: 'string - Name of the club/venue',
  website: 'string - Website URL',
  address: 'string - Full street address',
  city: 'string - City name',
  country: 'string - Country name',
  suburb: 'string - Suburb/neighborhood',
  phone: 'string - Phone number',
  email: 'string - Email address',
  whatsapp: 'string - WhatsApp number',
  google_maps_url: 'string - Google Maps URL',
  
  // Business info
  business_description: 'string - Description of the business',
  number_of_courts: 'number - Number of courts at venue',
  
  // Social media
  instagram_handle: 'string - Instagram username (without @)',
  instagram_profile_pic_url: 'string - Instagram profile picture URL',
  insta_url: 'string - Full Instagram profile URL',
  insta_bio: 'string - Instagram bio text',
  insta_followers: 'number - Instagram follower count',
  avg_likes: 'number - Average likes per post',
  avg_comments: 'number - Average comments per post',
  avg_video_views: 'number - Average video views',
  top_hashtags: 'array of strings - Common hashtags used',
  linkedin: 'string - LinkedIn URL',
  facebook: 'string - Facebook URL or handle',
  twitter: 'string - Twitter/X handle',
  
  // Branding
  logo: 'string - Logo image URL (from logo_storage_url)',
  color_palette: 'object - {primary, secondary, accent, background, text} hex colors',
  fonts: 'object - {primary, heading} font family names',
  attitude: 'string - Brand personality, voice, values',
  aesthetics: 'string - Visual style assessment',
  
  // Research / Perplexity data
  perplexity_description: 'string - Factual business description from web research',
  founder_info: 'string - Founder background and origin story',
  founding_year: 'string - Year established (e.g., "2015")',
  recent_activities: 'array of objects - Recent events [{title, date, description}]',
  perplexity_citations: 'array of strings - Source URLs from research',
  
  // People
  contact_name: 'string - Primary contact person name',
  key_individuals: 'array of strings - Key people at the club (owners, managers, pros)',
  coaches: 'array of strings - Coach names',
  
  // Organization
  ownership_group: 'string - Name of parent company/group if any',
  
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

    const { enrichmentData, clubName } = await req.json();

    if (!enrichmentData) {
      throw new Error('No enrichment data provided');
    }

    console.log(`Normalizing enrichment data for club: ${clubName || 'Unknown'}`);
    console.log('Raw enrichment data keys:', Object.keys(enrichmentData));

    const systemPrompt = `You are an intelligent data mapper for a CRM system. Your job is to map enrichment API results to a club database record.

CRITICAL INSTRUCTIONS:
1. Map ALL incoming data to the appropriate schema fields - do NOT ignore any data
2. If a field doesn't have an exact match, find the closest semantic match
3. For completely new fields with no match, add them to a "notes" field as structured text
4. Preserve ALL information - nothing should be lost

TARGET CLUB SCHEMA:
${JSON.stringify(CLUB_SCHEMA, null, 2)}

CRITICAL MAPPING RULES:

1. KEY_PEOPLE FIELD (VERY IMPORTANT):
   - The API returns "key_people" as an array of objects: [{name, role, context}, ...]
   - Extract JUST THE NAMES and put them in "key_individuals" as a string array
   - Example: key_people: [{name: "John Smith", role: "CEO", context: "..."}] → key_individuals: ["John Smith"]
   - DO NOT lose this data - always extract the names

2. Other field mappings:
   - "logo_storage_url" → "logo"
   - "instagram_followers" → "insta_followers" 
   - "instagram_bio" → "insta_bio"
   - "description" → "business_description"
   - "website_url" → "website"
   - Color/palette data → "color_palette" object with {primary, secondary, accent, background}
   - Font data → "fonts" object with {primary, heading}
   - Research/web data → appropriate perplexity fields
   - Dates should be ISO format or simple strings
   - Numbers should be actual numbers, not strings
   - Arrays should be actual arrays, not comma-separated strings
   - Remove @ from Instagram handles
   - Add https:// to URLs if missing

Respond with ONLY valid JSON - no markdown, no explanation. The JSON should contain only the mapped fields that have values.`;

    const userPrompt = `Map this enrichment API response to the club schema:

${JSON.stringify(enrichmentData, null, 2)}

Return ONLY the mapped JSON object with field names matching the schema. Include ALL data - nothing should be lost.`;

    console.log('Calling Claude Sonnet for intelligent mapping...');

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
    console.log('Claude Sonnet response received');

    const textContent = anthropicResponse.content?.find((c: { type: string }) => c.type === 'text');
    if (!textContent?.text) {
      throw new Error('No text content in response');
    }

    // Parse the JSON from response
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

    console.log('Mapped fields:', Object.keys(mappedData));

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
    console.error('Normalize club enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
