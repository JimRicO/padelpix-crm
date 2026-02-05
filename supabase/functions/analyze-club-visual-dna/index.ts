 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 const GTM_BASE = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1";
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const CRM_API_KEY = Deno.env.get('CRM_API_KEY');
     if (!CRM_API_KEY) {
       throw new Error('CRM_API_KEY is not configured');
     }
 
     const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
     if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error('Supabase credentials not configured');
     }
 
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     const { club_id } = await req.json();
     if (!club_id) {
       return new Response(
         JSON.stringify({ success: false, error: 'club_id is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Starting Visual DNA analysis for club: ${club_id}`);
 
     // Step 1: Fetch the club from CRM database
     const { data: club, error: clubError } = await supabase
       .from('clubs')
       .select('*')
       .eq('id', club_id)
       .single();
 
     if (clubError || !club) {
       console.error('Failed to fetch club:', clubError);
       return new Response(
         JSON.stringify({ success: false, error: 'Club not found' }),
         { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Step 2: Validate club has Instagram handle
     if (!club.instagram_handle) {
       return new Response(
         JSON.stringify({ success: false, error: 'No Instagram handle found. Enrich the club first.' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Step 3: Find corresponding enriched club in GTM
     let gtmClub = null;
     
     // Try by enrichment_job_id first
     if (club.enrichment_job_id) {
       console.log(`Looking up GTM club by job_id: ${club.enrichment_job_id}`);
       const gtmResponse = await fetch(`${GTM_BASE}/api-get-clubs?job_id=${club.enrichment_job_id}`, {
         method: 'GET',
         headers: { 'x-api-key': CRM_API_KEY },
       });
 
       if (gtmResponse.ok) {
         const gtmData = await gtmResponse.json();
         console.log('GTM lookup by job_id response:', JSON.stringify(gtmData).substring(0, 200));
         
         // Handle both array and single club response
         if (Array.isArray(gtmData) && gtmData.length > 0) {
           gtmClub = gtmData[0];
         } else if (gtmData.clubs && gtmData.clubs.length > 0) {
           gtmClub = gtmData.clubs[0];
         } else if (gtmData.id) {
           gtmClub = gtmData;
         }
       }
     }
 
     // Fallback: Try by club name
     if (!gtmClub) {
       console.log(`Looking up GTM club by name: ${club.club_name}`);
       const gtmResponse = await fetch(`${GTM_BASE}/api-get-clubs?search=${encodeURIComponent(club.club_name)}`, {
         method: 'GET',
         headers: { 'x-api-key': CRM_API_KEY },
       });
 
       if (gtmResponse.ok) {
         const gtmData = await gtmResponse.json();
         console.log('GTM lookup by name response:', JSON.stringify(gtmData).substring(0, 200));
         
         if (Array.isArray(gtmData) && gtmData.length > 0) {
           gtmClub = gtmData[0];
         } else if (gtmData.clubs && gtmData.clubs.length > 0) {
           gtmClub = gtmData.clubs[0];
         }
       }
     }
 
     if (!gtmClub || !gtmClub.id) {
       console.error('Club not found in GTM');
       return new Response(
         JSON.stringify({ success: false, error: 'Club not found in GTM. Run enrichment first.' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log(`Found GTM club: ${gtmClub.id} (${gtmClub.club_name || gtmClub.name})`);
 
     // Step 4: Call GTM's analyze-visual-dna function
     console.log(`Triggering Visual DNA analysis for enriched_club_id: ${gtmClub.id}`);
     const analyzeResponse = await fetch(`${GTM_BASE}/analyze-visual-dna`, {
       method: 'POST',
       headers: {
         'x-api-key': CRM_API_KEY,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ enriched_club_id: gtmClub.id }),
     });
 
     if (!analyzeResponse.ok) {
       const errorText = await analyzeResponse.text();
       console.error('Visual DNA analysis failed:', errorText);
       return new Response(
         JSON.stringify({ success: false, error: `Visual DNA analysis failed: ${errorText}` }),
         { status: analyzeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const analyzeResult = await analyzeResponse.json();
     console.log('Visual DNA analysis result:', JSON.stringify(analyzeResult).substring(0, 500));
 
     // Step 5: Fetch updated enriched club data from GTM
     console.log('Fetching updated GTM club data...');
     const updatedGtmResponse = await fetch(`${GTM_BASE}/api-get-clubs?id=${gtmClub.id}`, {
       method: 'GET',
       headers: { 'x-api-key': CRM_API_KEY },
     });
 
     let visualDnaData = null;
     if (updatedGtmResponse.ok) {
       const updatedData = await updatedGtmResponse.json();
       console.log('Updated GTM data:', JSON.stringify(updatedData).substring(0, 500));
       
       if (Array.isArray(updatedData) && updatedData.length > 0) {
         visualDnaData = updatedData[0];
       } else if (updatedData.clubs && updatedData.clubs.length > 0) {
         visualDnaData = updatedData.clubs[0];
       } else if (updatedData.id) {
         visualDnaData = updatedData;
       }
     }
 
     // Use analyzeResult if GTM refetch didn't work
     if (!visualDnaData) {
       visualDnaData = analyzeResult;
     }
 
     // Step 6: Store results in CRM clubs table
     const updatePayload: Record<string, unknown> = {
       visual_dna_analyzed_at: new Date().toISOString(),
     };
 
     if (visualDnaData.visual_dna) {
       updatePayload.visual_dna = visualDnaData.visual_dna;
     }
     if (visualDnaData.voice_dna) {
       updatePayload.voice_dna = visualDnaData.voice_dna;
     }
     if (visualDnaData.ctlt_matches) {
       updatePayload.ctlt_matches = visualDnaData.ctlt_matches;
     }
     if (typeof visualDnaData.invisibility_score === 'number') {
       updatePayload.invisibility_score = visualDnaData.invisibility_score;
     }
     if (visualDnaData.invisibility_category) {
       updatePayload.invisibility_category = visualDnaData.invisibility_category;
     }
 
     console.log('Updating CRM club with Visual DNA data:', Object.keys(updatePayload));
 
     const { error: updateError } = await supabase
       .from('clubs')
       .update(updatePayload)
       .eq('id', club_id);
 
     if (updateError) {
       console.error('Failed to update club:', updateError);
       return new Response(
         JSON.stringify({ success: false, error: `Failed to save results: ${updateError.message}` }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log('Visual DNA analysis complete for club:', club_id);
 
     return new Response(
       JSON.stringify({
         success: true,
         message: 'Visual DNA analyzed successfully',
         visual_dna: updatePayload.visual_dna || null,
         voice_dna: updatePayload.voice_dna || null,
         ctlt_matches: updatePayload.ctlt_matches || null,
         invisibility_score: updatePayload.invisibility_score || null,
         invisibility_category: updatePayload.invisibility_category || null,
         analyzed_at: updatePayload.visual_dna_analyzed_at,
       }),
       { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error: unknown) {
     console.error('Error in analyze-club-visual-dna:', error);
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });