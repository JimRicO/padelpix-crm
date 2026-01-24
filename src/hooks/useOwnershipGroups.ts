import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OwnershipGroup {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  logo_url: string | null;
  brand_color: string | null;
  website: string | null;
  relationship_status: string | null;
  total_clubs: number | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export function useOwnershipGroupsList() {
  return useQuery({
    queryKey: ['ownership-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ownership_groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as OwnershipGroup[];
    },
  });
}

export function useOwnershipGroupByName(name: string | null) {
  return useQuery({
    queryKey: ['ownership-group', name],
    queryFn: async () => {
      if (!name) return null;
      
      const { data, error } = await supabase
        .from('ownership_groups')
        .select('*')
        .eq('name', name)
        .maybeSingle();
      
      if (error) throw error;
      return data as OwnershipGroup | null;
    },
    enabled: !!name,
  });
}

export function useCreateOwnershipGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<OwnershipGroup> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('ownership_groups')
        .insert({ ...data, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return result as OwnershipGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
      toast({ title: 'Group created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create group', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOwnershipGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<OwnershipGroup> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('ownership_groups')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as OwnershipGroup;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
      queryClient.invalidateQueries({ queryKey: ['ownership-group', data.name] });
      toast({ title: 'Group updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update group', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpsertOwnershipGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<OwnershipGroup> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if group exists
      const { data: existing } = await supabase
        .from('ownership_groups')
        .select('id')
        .eq('name', data.name)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data: result, error } = await supabase
          .from('ownership_groups')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return result as OwnershipGroup;
      } else {
        // Create new
        const { data: result, error } = await supabase
          .from('ownership_groups')
          .insert({ ...data, created_by: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return result as OwnershipGroup;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
      queryClient.invalidateQueries({ queryKey: ['ownership-group', data.name] });
      toast({ title: 'Group saved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to save group', description: error.message, variant: 'destructive' });
    },
  });
}

export function useMissingOrganizations(clubOwnershipGroups: string[], existingOrgNames: string[]) {
  return clubOwnershipGroups.filter(
    name => name && name.trim() && !existingOrgNames.includes(name)
  );
}

export function useSyncMissingOrganizations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (missingNames: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (missingNames.length === 0) {
        return { created: 0 };
      }

      const recordsToInsert = missingNames.map(name => ({
        name,
        relationship_status: 'active',
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('ownership_groups')
        .insert(recordsToInsert);

      if (error) throw error;
      return { created: missingNames.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ownership-groups'] });
      toast({ 
        title: 'Organizations synced', 
        description: `Created ${result.created} missing organization${result.created !== 1 ? 's' : ''}` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to sync organizations', description: error.message, variant: 'destructive' });
    },
  });
}
