import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export type OrganizationType = 'commercial' | 'association';

export const ORGANIZATION_TYPES = [
  { 
    value: 'commercial' as const, 
    label: 'Commercial', 
    description: 'Club chains & ownership groups' 
  },
  { 
    value: 'association' as const, 
    label: 'Association', 
    description: 'Federations & governing bodies' 
  },
] as const;

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
  organization_type: OrganizationType | null;
  // Enrichment fields
  description: string | null;
  instagram_handle: string | null;
  instagram_followers: number | null;
  instagram_bio: string | null;
  address: string | null;
  color_palette: { primary?: string; secondary?: string; accent?: string; background?: string } | null;
  fonts: { primary?: string; heading?: string } | null;
  attitude: string | null;
  aesthetics: string | null;
  perplexity_description: string | null;
  founder_info: string | null;
  founding_year: string | null;
  recent_activities: Json | null;
  perplexity_citations: string[] | null;
  enrichment_job_id: string | null;
  enrichment_status: string | null;
  enriched_at: string | null;
}

// Type for database operations (omit computed/readonly fields)
type OwnershipGroupInsert = Omit<OwnershipGroup, 'id' | 'created_at' | 'updated_at'>;
type OwnershipGroupUpdate = Partial<Omit<OwnershipGroup, 'id' | 'created_at' | 'updated_at' | 'created_by'>>;

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
    mutationFn: async (data: Partial<OwnershipGroupInsert> & { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        name: data.name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        notes: data.notes,
        logo_url: data.logo_url,
        brand_color: data.brand_color,
        website: data.website,
        relationship_status: data.relationship_status,
        total_clubs: data.total_clubs,
        country: data.country,
        organization_type: data.organization_type || 'commercial',
        created_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('ownership_groups')
        .insert(insertData)
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
    mutationFn: async ({ id, ...data }: OwnershipGroupUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('ownership_groups')
        .update(data as Record<string, unknown>)
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
    mutationFn: async (data: OwnershipGroupUpdate & { name: string }) => {
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
          .update(data as Record<string, unknown>)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return result as OwnershipGroup;
      } else {
        // Create new
        const insertData = {
          name: data.name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          notes: data.notes,
          logo_url: data.logo_url,
          brand_color: data.brand_color,
          website: data.website,
          relationship_status: data.relationship_status,
          total_clubs: data.total_clubs,
          country: data.country,
          organization_type: data.organization_type || 'commercial',
          created_by: user.id,
        };
        
        const { data: result, error } = await supabase
          .from('ownership_groups')
          .insert(insertData)
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
