import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Club, PipelineStage } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Club[];
    },
  });
}

export function useClub(id: string | null) {
  return useQuery({
    queryKey: ['club', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Club | null;
    },
    enabled: !!id,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (club: { club_name: string; [key: string]: unknown }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          club_name: club.club_name,
          instagram_handle: club.instagram_handle as string | undefined,
          city: club.city as string | undefined,
          country: club.country as string | undefined,
          website: club.website as string | undefined,
          whatsapp: club.whatsapp as string | undefined,
          email: club.email as string | undefined,
          number_of_courts: club.number_of_courts as number | undefined,
          address: club.address as string | undefined,
          tier: club.tier as 'enterprise' | 'multi_court' | 'boutique' | undefined,
          priority: club.priority as 'high' | 'medium' | 'low' | undefined,
          notes: club.notes as string | undefined,
          contact_name: club.contact_name as string | undefined,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({ title: 'Club created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create club', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club', data.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update club', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateClubStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: PipelineStage }) => {
      const stageTimestamps: Record<string, string> = {};
      const now = new Date().toISOString();
      
      switch (stage) {
        case 'followed':
          stageTimestamps.followed_date = now;
          break;
        case 'dm_sent':
          stageTimestamps.first_dm_date = now;
          break;
        case 'responded':
          stageTimestamps.first_response_date = now;
          break;
        case 'content_created':
          stageTimestamps.content_created_date = now;
          break;
        case 'trial':
          stageTimestamps.trial_start_date = now;
          break;
        case 'customer':
          stageTimestamps.converted_date = now;
          break;
      }

      const { data, error } = await supabase
        .from('clubs')
        .update({ 
          pipeline_stage: stage,
          ...stageTimestamps,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club', data.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update stage', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({ title: 'Club deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete club', description: error.message, variant: 'destructive' });
    },
  });
}

interface BulkClubData {
  club_name: string;
  instagram_handle?: string;
  city?: string;
  country?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  number_of_courts?: number;
  address?: string;
  tier?: 'enterprise' | 'multi_court' | 'boutique';
  priority?: 'high' | 'medium' | 'low';
}

export function useBulkCreateClubs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clubs: BulkClubData[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const clubsWithUser = clubs.map(club => ({
        club_name: club.club_name,
        instagram_handle: club.instagram_handle,
        city: club.city,
        country: club.country,
        website: club.website,
        whatsapp: club.whatsapp,
        email: club.email,
        number_of_courts: club.number_of_courts,
        address: club.address,
        tier: club.tier,
        priority: club.priority,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('clubs')
        .insert(clubsWithUser)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({ title: `${data.length} clubs imported successfully` });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to import clubs', description: error.message, variant: 'destructive' });
    },
  });
}