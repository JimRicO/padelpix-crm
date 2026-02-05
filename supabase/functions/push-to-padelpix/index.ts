 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const PADELPIX_APP_URL = Deno.env.get('PADELPIX_APP_URL');
     const PADELPIX_APP_API_KEY = Deno.env.get('PADELPIX_APP_API_KEY');
     const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 
     if (!PADELPIX_APP_URL || !PADELPIX_APP_API_KEY) {
       throw new Error('PadelPix API configuration is missing');
     }
 
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error('Supabase configuration is missing');
     }
 
     const { club_id } = await req.json();
 
     if (!club_id) {
       throw new Error('club_id is required');
     }
 
     console.log(`Push to PadelPix: Starting for club ${club_id}`);
 
     // Create Supabase client with service role
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Fetch club data
     const { data: club, error: fetchError } = await supabase
       .from('clubs')
       .select('*')
       .eq('id', club_id)
       .single();
 
     if (fetchError) {
       console.error('Error fetching club:', fetchError);
       throw new Error(`Failed to fetch club: ${fetchError.message}`);
     }
 
     if (!club) {
       throw new Error('Club not found');
     }
 
     console.log(`Push to PadelPix: Found club "${club.club_name}"`);
 
     // Check if club has minimum required data
     if (!club.club_name) {
       throw new Error('Club must have a name to be pushed to PadelPix');
     }
 
     // Build payload from available club fields
     // Map CRM fields to PadelPix API expected fields
     const payload: Record<string, unknown> = {
       // Required
       club_name: club.club_name,
       
       // Identity & Contact
       logo_url: club.logo || club.instagram_profile_pic_url || null,
       website_url: club.website || null,
       instagram_handle: club.instagram_handle || null,
       address: club.address || null,
       city: club.city || null,
       country: club.country || null,
       phone: club.phone || null,
       email: club.email || null,
       whatsapp: club.whatsapp || null,
       
       // Business description
       description: club.business_description || club.perplexity_description || null,
       
       // Branding & Visual Identity
       color_palette: club.color_palette || null,
       font_preference: club.fonts || null,
       attitude: club.attitude || null,
       aesthetics: club.aesthetics || null,
       
       // Social Media Metrics (useful for personalization)
       insta_bio: club.insta_bio || null,
       insta_followers: club.insta_followers || null,
       avg_likes: club.avg_likes || null,
       
       // Research data
       founder_info: club.founder_info || null,
       founding_year: club.founding_year || null,
       
       // Key people
       key_people: club.key_people || null,
       key_individuals: club.key_individuals || null,
       
       // Facility info
       number_of_courts: club.number_of_courts || null,
       
       // Ownership
       ownership_group: club.ownership_group || null,
       
       // CRM reference
       crm_club_id: club.id,
     };
 
     // Remove null values for cleaner payload
     const cleanPayload = Object.fromEntries(
       Object.entries(payload).filter(([_, v]) => v !== null)
     );
 
     console.log(`Push to PadelPix: Sending payload with ${Object.keys(cleanPayload).length} fields`);
     console.log('Payload keys:', Object.keys(cleanPayload));
 
     // Call PadelPix API
     const padelPixUrl = `${PADELPIX_APP_URL}/functions/v1/api-create-club-profile`;
     console.log(`Push to PadelPix: Calling ${padelPixUrl}`);
 
     const response = await fetch(padelPixUrl, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${PADELPIX_APP_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(cleanPayload),
     });
 
     const responseText = await response.text();
     console.log(`Push to PadelPix: Response status ${response.status}`);
     console.log(`Push to PadelPix: Response body:`, responseText);
 
     if (!response.ok) {
       throw new Error(`PadelPix API error: ${response.status} - ${responseText}`);
     }
 
     let result;
     try {
       result = JSON.parse(responseText);
     } catch {
       result = { message: responseText };
     }
 
     // Extract club_profile_id from response
     const clubProfileId = result.club_profile_id || result.id || null;
 
     // Update CRM club with push timestamp and profile ID
     const updateData: Record<string, unknown> = {
       pushed_to_padelpix_at: new Date().toISOString(),
     };
 
     if (clubProfileId) {
       updateData.padelpix_club_profile_id = clubProfileId;
     }
 
     const { error: updateError } = await supabase
       .from('clubs')
       .update(updateData)
       .eq('id', club_id);
 
     if (updateError) {
       console.error('Error updating club after push:', updateError);
       // Don't throw - the push succeeded, just log the update failure
     }
 
     console.log(`Push to PadelPix: Success! Club "${club.club_name}" pushed`);
 
     return new Response(
       JSON.stringify({
         success: true,
         message: `Club "${club.club_name}" pushed to PadelPix`,
         club_profile_id: clubProfileId,
         pushed_at: updateData.pushed_to_padelpix_at,
       }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Push to PadelPix error:', error);
     return new Response(
       JSON.stringify({ 
         success: false, 
         error: error instanceof Error ? error.message : 'Unknown error' 
       }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });