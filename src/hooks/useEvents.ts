import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Event {
  id: string;
  name: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  name: string;
  event_type: string;
  status?: string;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  description?: string | null;
  notes?: string | null;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export const EVENT_TYPES = [
  { value: 'festival', label: 'Festival' },
  { value: 'conference', label: 'Conference' },
  { value: 'fair', label: 'Fair' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_STATUSES = [
  { value: 'interested', label: 'Interested' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'attending', label: 'Attending' },
  { value: 'attended', label: 'Attended' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export function useEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events' as any)
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as unknown as Event[];
    },
    enabled: !!user,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events' as any)
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEventInput) => {
      const { data, error } = await supabase
        .from('events' as any)
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
