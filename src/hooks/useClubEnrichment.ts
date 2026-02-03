import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Club } from '@/types/database';

interface EnrichmentStatusResponse {
  success: boolean;
  status?: {
    job_id: string;
    status: string;
    total_rows: number;
    processed_rows: number;
    progress_percent: number;
    is_complete: boolean;
  };
  results?: Array<{
    id: string;
    club_name: string;
    website_url?: string;
    // Social media fields
    instagram_handle?: string;
    instagram_url?: string;
    instagram_followers?: number;
    instagram_bio?: string;
    instagram_profile_pic_url?: string;
    facebook_url?: string;
    twitter_handle?: string;
    linkedin_url?: string;
    // Contact & description
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    logo_storage_url?: string;
    color_palette?: { primary?: string; secondary?: string; accent?: string; background?: string };
    fonts?: { primary?: string; heading?: string };
    attitude?: string;
    aesthetics?: string;
    perplexity_description?: string;
    founder_info?: string;
    founding_year?: string;
    recent_activities?: Array<{ title?: string; date?: string; description?: string }>;
    perplexity_citations?: string[];
    key_people?: Array<{ name?: string; role?: string; context?: string }>;
    key_individuals?: string[];
  }>;
  error?: string;
}

export function useClubEnrichmentPolling(clubs: Club[] | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Find clubs with pending enrichment
  const pendingClubs = clubs?.filter(
    c => c.enrichment_status === 'pending' || c.enrichment_status === 'processing'
  ) || [];

  // Poll for status updates
  const { data: statusUpdates } = useQuery({
    queryKey: ['club-enrichment-status', pendingClubs.map(c => c.enrichment_job_id).join(',')],
    queryFn: async () => {
      const results: Record<string, EnrichmentStatusResponse> = {};
      
      await Promise.all(
        pendingClubs.map(async (club) => {
          if (!club.enrichment_job_id) return;
          
          try {
            const { data, error } = await supabase.functions.invoke('get-enrichment-status', {
              body: { job_id: club.enrichment_job_id },
            });
            
            if (!error && data) {
              results[club.id] = data;
            }
          } catch (err) {
            console.error(`Failed to check status for ${club.club_name}:`, err);
          }
        })
      );
      
      return results;
    },
    enabled: pendingClubs.length > 0,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
  });

  // Apply results when enrichment completes - uses AI to intelligently map ALL fields
  const applyResultsMutation = useMutation({
    mutationFn: async ({ clubId, results, clubName }: { clubId: string; results: unknown; clubName?: string }) => {
      // Handle different result structures - API returns { clubs: [...] }
      let clubsArray: Array<Record<string, unknown>> = [];
      
      if (Array.isArray(results)) {
        clubsArray = results;
      } else if (results && typeof results === 'object' && 'clubs' in results) {
        const resultsObj = results as { clubs?: unknown };
        if (Array.isArray(resultsObj.clubs)) {
          clubsArray = resultsObj.clubs;
        }
      }
      
      if (clubsArray.length === 0) {
        console.log('No enrichment results found for club');
        return null;
      }
      
      const rawEnrichmentData = clubsArray[0]; // Take first result
      console.log('Raw enrichment data from API:', rawEnrichmentData);
      console.log('Raw enrichment keys:', Object.keys(rawEnrichmentData));

      // Use Claude Sonnet to intelligently map ALL enrichment data
      console.log('Calling AI normalization for intelligent field mapping...');
      const { data: normalizeResult, error: normalizeError } = await supabase.functions.invoke(
        'normalize-club-enrichment',
        {
          body: {
            enrichmentData: rawEnrichmentData,
            clubName: clubName,
          },
        }
      );

      if (normalizeError) {
        console.error('AI normalization failed, falling back to manual mapping:', normalizeError);
        // Fallback to basic mapping if AI fails
      }

      let updateData: Record<string, unknown> = {
        enrichment_status: 'completed',
        enriched_at: new Date().toISOString(),
      };

      if (normalizeResult?.success && normalizeResult?.mappedData) {
        // Use AI-mapped data - this captures ALL fields including new ones
        console.log('Using AI-mapped enrichment data:', normalizeResult.mappedData);
        console.log('Mapped keys:', normalizeResult.mappedKeys);
        
        // Merge AI-mapped data with status fields
        updateData = {
          ...normalizeResult.mappedData,
          enrichment_status: 'completed',
          enriched_at: new Date().toISOString(),
        };
        
        // Remove any fields that shouldn't be in the update (like club_name, id)
        delete updateData.club_name;
        delete updateData.id;
      } else {
        // Fallback: manual field mapping (legacy behavior)
        console.log('Fallback to manual mapping');
        const enrichmentData = rawEnrichmentData as Record<string, unknown>;
        
        if (enrichmentData.description) updateData.business_description = enrichmentData.description;
        if (enrichmentData.instagram_handle) updateData.instagram_handle = enrichmentData.instagram_handle;
        if (enrichmentData.instagram_url) updateData.insta_url = enrichmentData.instagram_url;
        if (enrichmentData.instagram_followers) updateData.insta_followers = enrichmentData.instagram_followers;
        if (enrichmentData.instagram_bio) updateData.insta_bio = enrichmentData.instagram_bio;
        if (enrichmentData.instagram_profile_pic_url) updateData.instagram_profile_pic_url = enrichmentData.instagram_profile_pic_url;
        // Social media mappings
        if (enrichmentData.facebook_url) updateData.facebook = enrichmentData.facebook_url;
        if (enrichmentData.twitter_handle) updateData.twitter = enrichmentData.twitter_handle;
        if (enrichmentData.linkedin_url) updateData.linkedin = enrichmentData.linkedin_url;
        // Contact & location
        if (enrichmentData.address) updateData.address = enrichmentData.address;
        if (enrichmentData.logo_storage_url) updateData.logo = enrichmentData.logo_storage_url;
        if (enrichmentData.email) updateData.email = enrichmentData.email;
        if (enrichmentData.phone) updateData.phone = enrichmentData.phone;
        if (enrichmentData.website_url) updateData.website = enrichmentData.website_url;
        // Brand identity
        if (enrichmentData.color_palette) updateData.color_palette = enrichmentData.color_palette;
        if (enrichmentData.fonts) updateData.fonts = enrichmentData.fonts;
        if (enrichmentData.attitude) updateData.attitude = enrichmentData.attitude;
        if (enrichmentData.aesthetics) updateData.aesthetics = enrichmentData.aesthetics;
        // Research data
        if (enrichmentData.founder_info) updateData.founder_info = enrichmentData.founder_info;
        if (enrichmentData.founding_year) updateData.founding_year = enrichmentData.founding_year;
        if (enrichmentData.perplexity_description) updateData.perplexity_description = enrichmentData.perplexity_description;
        if (enrichmentData.perplexity_citations) updateData.perplexity_citations = enrichmentData.perplexity_citations;
        if (enrichmentData.recent_activities) updateData.recent_activities = enrichmentData.recent_activities;
        if (enrichmentData.key_individuals) updateData.key_individuals = enrichmentData.key_individuals;
        if (enrichmentData.key_people) {
          updateData.key_people = enrichmentData.key_people;

          // If API provided structured key_people but not a separate key_individuals list,
          // derive the names so downstream UI still has a lightweight fallback.
          if (!updateData.key_individuals && Array.isArray(enrichmentData.key_people)) {
            const names = enrichmentData.key_people
              .map((p) => {
                if (typeof p === 'string') return p;
                if (p && typeof p === 'object' && 'name' in p && typeof (p as any).name === 'string') {
                  return (p as any).name as string;
                }
                return null;
              })
              .filter(Boolean) as string[];

            if (names.length > 0) updateData.key_individuals = names;
          }
        }
      }

      console.log('Final update data for club:', updateData);

      const { error } = await supabase
        .from('clubs')
        .update(updateData)
        .eq('id', clubId);

      if (error) throw error;
      return updateData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      const club = pendingClubs.find(c => c.id === variables.clubId);
      toast({
        title: 'Enrichment complete',
        description: `${club?.club_name || 'Club'} has been enriched with new data`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to apply club enrichment results:', error);
      toast({
        title: 'Failed to save enrichment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check for completed enrichments and apply results
  useEffect(() => {
    if (!statusUpdates) return;

    Object.entries(statusUpdates).forEach(([clubId, response]) => {
      if (response.status?.is_complete && response.results) {
        const club = pendingClubs.find(c => c.id === clubId);
        applyResultsMutation.mutate({ 
          clubId, 
          results: response.results,
          clubName: club?.club_name,
        });
      }
    });
  }, [statusUpdates]);

  return {
    pendingCount: pendingClubs.length,
    isPolling: pendingClubs.length > 0,
  };
}

export function useStartClubEnrichment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      clubId, 
      name, 
      website, 
      instagramHandle 
    }: { 
      clubId: string; 
      name: string; 
      website?: string; 
      instagramHandle?: string;
    }) => {
      // Submit enrichment request
      const { data, error } = await supabase.functions.invoke('enrich-club', {
        body: {
          club_name: name,
          website_url: website || undefined,
          instagram_handle: instagramHandle || undefined,
        },
      });

      if (error) throw error;

      // Save job ID and status to database
      if (data?.job_id) {
        const { error: updateError } = await supabase
          .from('clubs')
          .update({
            enrichment_job_id: data.job_id,
            enrichment_status: 'pending',
          })
          .eq('id', clubId);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: 'Enrichment started',
        description: `${variables.name} is being enriched`,
      });
    },
    onError: (error: Error, variables) => {
      toast({
        title: 'Enrichment failed',
        description: error.message || `Could not start enrichment for ${variables.name}`,
        variant: 'destructive',
      });
    },
  });
}
