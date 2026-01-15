import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { PersonLink, PersonLinkSuggestion } from '@/types/people';

export function usePersonLinks(personId: string | undefined) {
  return useQuery({
    queryKey: ['person-links', personId],
    queryFn: async () => {
      if (!personId) return [];
      const { data, error } = await supabase
        .from('person_links')
        .select('*')
        .eq('person_id', personId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data as PersonLink[];
    },
    enabled: !!personId,
  });
}

export function useCreatePersonLink() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (link: Partial<PersonLink>) => {
      const { data, error } = await supabase
        .from('person_links')
        .insert({
          person_id: link.person_id!,
          link_type: link.link_type!,
          club_id: link.club_id,
          ownership_group_name: link.ownership_group_name,
          role_at_entity: link.role_at_entity,
          is_primary: link.is_primary,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['person-links', variables.person_id] });
      toast.success('Link created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create link: ' + error.message);
    },
  });
}

export function useDeletePersonLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, personId }: { id: string; personId: string }) => {
      const { error } = await supabase
        .from('person_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return personId;
    },
    onSuccess: (personId) => {
      queryClient.invalidateQueries({ queryKey: ['person-links', personId] });
      toast.success('Link removed');
    },
    onError: (error) => {
      toast.error('Failed to remove link: ' + error.message);
    },
  });
}

export function usePersonLinkSuggestions(personId: string | undefined) {
  return useQuery({
    queryKey: ['person-link-suggestions', personId],
    queryFn: async () => {
      if (!personId) return [];
      const { data, error } = await supabase
        .from('person_link_suggestions')
        .select('*')
        .eq('person_id', personId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PersonLinkSuggestion[];
    },
    enabled: !!personId,
  });
}

export function useUpdateSuggestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, personId }: { id: string; status: 'approved' | 'rejected'; personId: string }) => {
      const { error } = await supabase
        .from('person_link_suggestions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return personId;
    },
    onSuccess: (personId) => {
      queryClient.invalidateQueries({ queryKey: ['person-link-suggestions', personId] });
      queryClient.invalidateQueries({ queryKey: ['person-links', personId] });
    },
    onError: (error) => {
      toast.error('Failed to update suggestion: ' + error.message);
    },
  });
}
