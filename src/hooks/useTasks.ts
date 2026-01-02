import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useTasks(clubId?: string) {
  return useQuery({
    queryKey: ['tasks', clubId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (clubId) {
        query = query.eq('club_id', clubId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Task[];
    },
  });
}

interface CreateTaskData {
  club_id: string;
  title: string;
  description?: string;
  task_type?: string;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: CreateTaskData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          club_id: task.club_id,
          title: task.title,
          description: task.description,
          task_type: task.task_type,
          priority: task.priority,
          due_date: task.due_date,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.club_id] });
      toast({ title: 'Task created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create task', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.club_id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update task', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.club_id] });
    },
  });
}