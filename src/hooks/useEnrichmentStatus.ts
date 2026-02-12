import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { OwnershipGroup } from '@/hooks/useOwnershipGroups';

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
    instagram_handle?: string;
    instagram_followers?: number;
    instagram_bio?: string;
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
    recent_activities?: unknown;
    perplexity_citations?: string[];
  }>;
  error?: string;
}

export function useEnrichmentPolling(groups: OwnershipGroup[] | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Find groups with pending enrichment
  const pendingGroups = groups?.filter(
    g => g.enrichment_status === 'pending' || g.enrichment_status === 'processing'
  ) || [];

  // Poll for status updates
  const { data: statusUpdates } = useQuery({
    queryKey: ['enrichment-status', pendingGroups.map(g => g.enrichment_job_id).join(',')],
    queryFn: async () => {
      const results: Record<string, EnrichmentStatusResponse> = {};
      
      await Promise.all(
        pendingGroups.map(async (group) => {
          if (!group.enrichment_job_id) return;
          
          try {
            const { data, error } = await supabase.functions.invoke('get-enrichment-status', {
              body: { job_id: group.enrichment_job_id },
            });
            
            if (!error && data) {
              results[group.id] = data;
            }
          } catch (err) {
            console.error(`Failed to check status for ${group.name}:`, err);
          }
        })
      );
      
      return results;
    },
    enabled: pendingGroups.length > 0,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
  });

  // Apply results when enrichment completes
  const applyResultsMutation = useMutation({
    mutationFn: async ({ groupId, results, groupName }: { groupId: string; results: unknown; groupName?: string }) => {
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
        console.log('No enrichment results found');
        return null;
      }
      
      const rawEnrichmentData = clubsArray[0]; // Take first result
      console.log('Raw organization enrichment data:', rawEnrichmentData);
      console.log('Raw enrichment keys:', Object.keys(rawEnrichmentData));

      // Use Claude Sonnet to intelligently map ALL enrichment data
      console.log('Calling AI normalization for organization field mapping...');
      const { data: normalizeResult, error: normalizeError } = await supabase.functions.invoke(
        'normalize-organization-enrichment',
        {
          body: {
            enrichmentData: rawEnrichmentData,
            organizationName: groupName,
          },
        }
      );

      if (normalizeError) {
        console.error('AI normalization failed, falling back to manual mapping:', normalizeError);
      }

      let updateData: Record<string, unknown> = {
        enrichment_status: 'completed',
        enriched_at: new Date().toISOString(),
      };

      if (normalizeResult?.success && normalizeResult?.mappedData) {
        // Use AI-mapped data - this captures ALL fields including key_people
        console.log('Using AI-mapped organization data:', normalizeResult.mappedData);
        console.log('Mapped keys:', normalizeResult.mappedKeys);
        
        updateData = {
          ...normalizeResult.mappedData,
          enrichment_status: 'completed',
          enriched_at: new Date().toISOString(),
        };
        
        // Remove fields that shouldn't be in the update
        delete updateData.name;
        delete updateData.id;
      } else {
        // Fallback: manual field mapping (legacy behavior)
        console.log('Fallback to manual organization mapping');
        const enrichmentData = rawEnrichmentData;

        if (enrichmentData.description) updateData.description = enrichmentData.description;
        if (enrichmentData.instagram_handle) updateData.instagram_handle = enrichmentData.instagram_handle;
        if (enrichmentData.instagram_followers) updateData.instagram_followers = enrichmentData.instagram_followers;
        if (enrichmentData.instagram_bio) updateData.instagram_bio = enrichmentData.instagram_bio;
        if (enrichmentData.address) updateData.address = enrichmentData.address;
        if (enrichmentData.logo_storage_url) updateData.logo_url = enrichmentData.logo_storage_url;
        if (enrichmentData.color_palette) updateData.color_palette = enrichmentData.color_palette;
        if (enrichmentData.fonts) updateData.fonts = enrichmentData.fonts;
        if (enrichmentData.attitude) updateData.attitude = enrichmentData.attitude;
        if (enrichmentData.aesthetics) updateData.aesthetics = enrichmentData.aesthetics;
        if (enrichmentData.perplexity_description) updateData.perplexity_description = enrichmentData.perplexity_description;
        if (enrichmentData.founder_info) updateData.founder_info = enrichmentData.founder_info;
        if (enrichmentData.founding_year) updateData.founding_year = enrichmentData.founding_year;
        if (enrichmentData.recent_activities) updateData.recent_activities = enrichmentData.recent_activities;
        if (enrichmentData.perplexity_citations) updateData.perplexity_citations = enrichmentData.perplexity_citations;
        if (enrichmentData.email) updateData.contact_email = enrichmentData.email;
        if (enrichmentData.phone) updateData.contact_phone = enrichmentData.phone;
        if (enrichmentData.website_url) updateData.website = enrichmentData.website_url;
        // Key people - new fields
        if (enrichmentData.key_people) {
          updateData.key_people = enrichmentData.key_people;
          if (!updateData.key_individuals && Array.isArray(enrichmentData.key_people)) {
            const names = enrichmentData.key_people
              .map((p: unknown) => {
                if (typeof p === 'string') return p;
                if (p && typeof p === 'object' && 'name' in p) return (p as { name: string }).name;
                return null;
              })
              .filter(Boolean) as string[];
            if (names.length > 0) updateData.key_individuals = names;
          }
        }
        if (enrichmentData.key_individuals) updateData.key_individuals = enrichmentData.key_individuals;
      }

      console.log('Final update data for organization:', updateData);

      const { error } = await supabase
        .from('ownership_groups')
        .update(updateData)
        .eq('id', groupId);

      if (error) throw error;
      return updateData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
      queryClient.refetchQueries({ queryKey: ['ownership-groups'] });
      const group = pendingGroups.find(g => g.id === variables.groupId);
      toast({
        title: 'Enrichment complete',
        description: `${group?.name || 'Organization'} has been enriched with new data`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to apply enrichment results:', error);
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

    Object.entries(statusUpdates).forEach(([groupId, response]) => {
      if (response.status?.is_complete && response.results) {
        const group = pendingGroups.find(g => g.id === groupId);
        applyResultsMutation.mutate({ 
          groupId, 
          results: response.results,
          groupName: group?.name,
        });
      }
    });
  }, [statusUpdates]);

  return {
    pendingCount: pendingGroups.length,
    isPolling: pendingGroups.length > 0,
  };
}

export function useStartEnrichment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      groupId, 
      name, 
      website, 
      instagramHandle 
    }: { 
      groupId: string; 
      name: string; 
      website?: string; 
      instagramHandle?: string;
    }) => {
      // Submit enrichment request
      const { data, error } = await supabase.functions.invoke('enrich-organization', {
        body: {
          organization_name: name,
          website_url: website || undefined,
          instagram_handle: instagramHandle || undefined,
        },
      });

      if (error) throw error;

      // Save job ID and status to database
      if (data?.job_id) {
        const { error: updateError } = await supabase
          .from('ownership_groups')
          .update({
            enrichment_job_id: data.job_id,
            enrichment_status: 'pending',
          })
          .eq('id', groupId);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
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
