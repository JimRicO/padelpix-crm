import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EnrichedPerson } from '@/types/people';

interface CreateJobResponse {
  success: boolean;
  job_id?: string;
  error?: string;
}

interface StatusResponse {
  success: boolean;
  job_id?: string;
  status?: string;
  total_rows?: number;
  processed_rows?: number;
  progress_percent?: number;
  is_complete?: boolean;
  error?: string;
}

interface ResultsResponse {
  success: boolean;
  people?: EnrichedPerson[];
  error?: string;
}

export function useStartPersonResearch() {
  return useMutation({
    mutationFn: async ({ personName, context }: { personName: string; context?: string }) => {
      const { data, error } = await supabase.functions.invoke('enrich-person', {
        body: { person_name: personName, context },
      });

      if (error) throw error;
      
      const response = data as CreateJobResponse;
      if (!response.success) {
        throw new Error(response.error || 'Failed to create research job');
      }

      return response;
    },
    onError: (error) => {
      toast.error('Failed to start research: ' + error.message);
    },
  });
}

export function usePersonResearchStatus(jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['person-research-status', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-person?action=status&job_id=${jobId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const result = await response.json() as StatusResponse;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get status');
      }

      return result;
    },
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when complete
      if (data?.is_complete) return false;
      return 10000; // Poll every 10 seconds
    },
  });
}

export function usePersonResearchResults(jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['person-research-results', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-person?action=results&job_id=${jobId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const result = await response.json() as ResultsResponse;
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get results');
      }

      return result.people?.[0] || null;
    },
    enabled: !!jobId && enabled,
    staleTime: Infinity, // Results don't change once fetched
  });
}

// Hook to save enrichment data to the database
export function useSaveEnrichmentData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId, enrichmentData }: { personId: string; enrichmentData: EnrichedPerson }) => {
      const { data, error } = await supabase
        .from('people')
        .update({
          enrichment_data: JSON.parse(JSON.stringify(enrichmentData)),
          enriched_at: new Date().toISOString(),
          enrichment_job_id: null, // Clear job ID when results are saved
          enrichment_status: 'complete',
        })
        .eq('id', personId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['person-enrichment', variables.personId] });
      toast.success('Research completed and saved!');
    },
    onError: (error) => {
      console.error('Failed to save enrichment data:', error);
      toast.error('Failed to save research results');
    },
  });
}

// Hook to save job ID when research starts
export function useSaveEnrichmentJobId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId, jobId }: { personId: string; jobId: string }) => {
      const { data, error } = await supabase
        .from('people')
        .update({
          enrichment_job_id: jobId,
          enrichment_status: 'processing',
        })
        .eq('id', personId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['person-enrichment', variables.personId] });
    },
    onError: (error) => {
      console.error('Failed to save job ID:', error);
    },
  });
}

// Hook to clear job tracking (on error or cancel)
export function useClearEnrichmentJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personId: string) => {
      const { data, error } = await supabase
        .from('people')
        .update({
          enrichment_job_id: null,
          enrichment_status: null,
        })
        .eq('id', personId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, personId) => {
      queryClient.invalidateQueries({ queryKey: ['person-enrichment', personId] });
    },
  });
}

// Hook to load existing enrichment data from the database (including pending job)
export function usePersonEnrichmentData(personId: string) {
  return useQuery({
    queryKey: ['person-enrichment', personId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('enrichment_data, enriched_at, enrichment_job_id, enrichment_status')
        .eq('id', personId)
        .single();

      if (error) throw error;
      
      return {
        enrichmentData: data?.enrichment_data as unknown as EnrichedPerson | null,
        enrichedAt: data?.enriched_at,
        pendingJobId: data?.enrichment_job_id,
        jobStatus: data?.enrichment_status,
      };
    },
    enabled: !!personId,
  });
}
