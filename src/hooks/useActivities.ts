import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types/database';
import { useToast } from '@/hooks/use-toast';


export function useActivities(clubId?: string) {
  return useQuery({
    queryKey: ['activities', clubId],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('activity_date', { ascending: false });
      
      if (clubId) {
        query = query.eq('club_id', clubId);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as Activity[];
    },
  });
}

interface CreateActivityData {
  club_id: string;
  activity_type: string;
  title: string;
  description?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: CreateActivityData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          club_id: activity.club_id,
          activity_type: activity.activity_type,
          title: activity.title,
          description: activity.description,
          link: activity.link,
          metadata: activity.metadata as Record<string, unknown> | null,
          created_by: user?.id,
        }] as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', data.club_id] });
      toast({ title: 'Activity logged successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to log activity', description: error.message, variant: 'destructive' });
    },
  });
}