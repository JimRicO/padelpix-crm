import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AgendaEvent {
  id: string;
  event_date: string;
  end_date: string | null;
  event_time: string | null;
  title: string;
  description: string | null;
  event_type: 'manual' | 'system' | 'task' | 'industry';
  club_id: string | null;
  created_by: string;
  created_at: string;
  clubs?: {
    id: string;
    club_name: string;
  } | null;
}

export interface CreateAgendaEventInput {
  event_date: string;
  end_date?: string | null;
  event_time?: string | null;
  title: string;
  description?: string | null;
  club_id?: string | null;
  event_type?: 'manual' | 'system' | 'task' | 'industry';
}

export interface UpdateAgendaEventInput {
  id: string;
  event_date?: string;
  end_date?: string | null;
  event_time?: string | null;
  title?: string;
  description?: string | null;
  club_id?: string | null;
  event_type?: 'manual' | 'system' | 'task' | 'industry';
}

export function useAgendaEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agenda-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda_events' as any)
        .select(`
          *,
          clubs:club_id (
            id,
            club_name
          )
        `)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as unknown as AgendaEvent[];
    },
    enabled: !!user,
  });
}

export function useCreateAgendaEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAgendaEventInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('agenda_events' as any)
        .insert({
          ...input,
          event_type: input.event_type ?? 'manual',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
    },
  });
}

export function useUpdateAgendaEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAgendaEventInput) => {
      const { data, error } = await supabase
        .from('agenda_events' as any)
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
    },
  });
}

export function useDeleteAgendaEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agenda_events' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
    },
  });
}
