import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Full schema definitions for Claude
const SCHEMAS = {
  club: {
    required: ['club_name'],
    fields: {
      club_name: 'string - Name of the club/venue',
      instagram_handle: 'string - Instagram username (without @)',
      city: 'string - City name',
      country: 'string - Country name',
      suburb: 'string - Suburb/neighborhood',
      address: 'string - Full street address',
      phone: 'string - Phone number',
      email: 'string - Email address',
      website: 'string - Website URL',
      whatsapp: 'string - WhatsApp number',
      google_maps_url: 'string - Google Maps URL',
      number_of_courts: 'number - Number of courts at venue',
      contact_name: 'string - Primary contact person name',
      linkedin: 'string - LinkedIn URL',
      logo: 'string - Logo image URL',
      business_description: 'string - Description of the business',
      facebook: 'string - Facebook URL or handle',
      twitter: 'string - Twitter/X handle',
      insta_url: 'string - Full Instagram profile URL',
      insta_bio: 'string - Instagram bio text',
      insta_followers: 'number - Instagram follower count',
      avg_likes: 'number - Average likes per post',
      avg_comments: 'number - Average comments per post',
      avg_video_views: 'number - Average video views',
      top_hashtags: 'array of strings - Common hashtags used',
      key_individuals: 'array of strings - Key people at the club',
      coaches: 'array of strings - Coach names',
      ownership_group: 'string - Name of parent company/group if any',
      notes: 'string - Additional notes',
    },
  },
  organization: {
    required: ['name'],
    fields: {
      name: 'string - Organization name',
      organization_type: 'string - Either "commercial" (club chains) or "association" (federations)',
      country: 'string - Country name',
      address: 'string - Full address',
      website: 'string - Website URL',
      instagram_handle: 'string - Instagram username',
      instagram_bio: 'string - Instagram bio',
      instagram_followers: 'number - Instagram follower count',
      contact_name: 'string - Primary contact person',
      contact_email: 'string - Contact email',
      contact_phone: 'string - Contact phone',
      total_clubs: 'number - Number of clubs/members',
      relationship_status: 'string - Status like "prospect", "active", "inactive", "churned"',
      notes: 'string - Additional notes',
      description: 'string - Organization description',
      founder_info: 'string - Information about founders',
      founding_year: 'string - Year founded',
      logo_url: 'string - Logo image URL',
      brand_color: 'string - Primary brand color hex code',
    },
  },
  person: {
    required: ['full_name'],
    fields: {
      full_name: 'string - Full name of the person',
      role: 'string - Job title or role',
      email: 'string - Email address',
      phone: 'string - Phone number',
      country: 'string - Country',
      instagram_handle: 'string - Instagram username',
      linkedin: 'string - LinkedIn URL or username',
      notes: 'string - Additional notes',
      profile_image: 'string - Profile image URL',
      contact_date: 'string - Date of last contact (ISO format)',
      contact_method: 'string - How contacted: linkedin, email, phone, whatsapp, in_person, other',
    },
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { rawData, dataFormat } = await req.json();

    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
      throw new Error('No data provided');
    }

    console.log(`Normalizing ${dataFormat} data (${rawData.length} chars)`);

    const systemPrompt = `You are a data normalization assistant for a CRM system. Your job is to:
1. Detect what type of entity the data represents (club, organization, or person)
2. Transform the raw data into the correct schema format
3. Map input fields to the target schema fields

ENTITY DETECTION RULES:
- CLUB: Venues with courts, addresses, Google Maps links, padel/tennis facilities
- ORGANIZATION: Federations, associations, governing bodies, club chains/groups
- PERSON: Individual people with names, roles, contact info

AVAILABLE SCHEMAS:

CLUB SCHEMA:
${JSON.stringify(SCHEMAS.club.fields, null, 2)}

ORGANIZATION SCHEMA:
${JSON.stringify(SCHEMAS.organization.fields, null, 2)}

PERSON SCHEMA:
${JSON.stringify(SCHEMAS.person.fields, null, 2)}

IMPORTANT RULES:
1. Always try to extract country from addresses if not explicitly provided
2. Clean phone numbers but preserve international format
3. Remove @ from Instagram handles
4. Convert URLs to proper format (add https:// if missing)
5. Parse numbers from strings (e.g., "5 courts" -> 5)
6. For arrays like coaches or hashtags, split comma/semicolon separated values
7. If data contains multiple records, process all of them
8. Default country to "South Africa" only if truly ambiguous

Respond ONLY with valid JSON in this exact format:
{
  "entity_type": "club" | "organization" | "person",
  "confidence": "high" | "medium" | "low",
  "records": [...array of normalized records...],
  "field_mappings": { "original_field": "target_field", ... },
  "unmapped_fields": ["field1", "field2"],
  "warnings": ["warning1", "warning2"]
}`;

    const userPrompt = `Analyze and normalize this ${dataFormat} data:

${rawData}

Return the normalized data as JSON following the schema rules.`;

    console.log('Calling Anthropic Claude Haiku API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64000,
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
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const anthropicResponse = await response.json();
    const stopReason = anthropicResponse.stop_reason;
    console.log(`Anthropic response received (stop_reason: ${stopReason}, usage: ${JSON.stringify(anthropicResponse.usage)})`);

    // Extract the text content from Claude's response
    const textContent = anthropicResponse.content?.find((c: { type: string }) => c.type === 'text');
    if (!textContent?.text) {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON from Claude's response
    let parsedResult;
    try {
      let jsonText = textContent.text.trim();
      // Strip markdown code fences if present
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      
      // Try direct parse first
      try {
        parsedResult = JSON.parse(jsonText);
      } catch {
        // Extract the outermost JSON object
        const start = jsonText.indexOf('{');
        if (start === -1) throw new Error('No JSON object found in response');
        let candidate = jsonText.substring(start);
        
        // Try parsing as-is
        try {
          parsedResult = JSON.parse(candidate);
        } catch {
          // JSON is likely truncated — try to repair by closing open braces/brackets
          // Remove trailing commas and incomplete values
          candidate = candidate.replace(/,\s*$/, '');
          // Remove any trailing incomplete string/value
          candidate = candidate.replace(/,\s*\{[^}]*$/, '');
          candidate = candidate.replace(/,\s*"[^"]*$/, '');
          
          // Count unbalanced braces and brackets
          let braces = 0, brackets = 0;
          for (const char of candidate) {
            if (char === '{') braces++;
            if (char === '}') braces--;
            if (char === '[') brackets++;
            if (char === ']') brackets--;
          }
          
          // Close open structures
          while (brackets > 0) { candidate += ']'; brackets--; }
          while (braces > 0) { candidate += '}'; braces--; }
          
          // Remove trailing commas before closures
          candidate = candidate.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          console.log('Attempting to parse repaired JSON...');
          parsedResult = JSON.parse(candidate);
          console.log('Successfully parsed repaired (truncated) JSON');
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate the response structure
    if (!parsedResult.entity_type || !parsedResult.records || !Array.isArray(parsedResult.records)) {
      throw new Error('Invalid response structure from AI');
    }

    console.log(`Normalized ${parsedResult.records.length} ${parsedResult.entity_type} records`);

    return new Response(
      JSON.stringify({
        success: true,
        ...parsedResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Normalize data error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
