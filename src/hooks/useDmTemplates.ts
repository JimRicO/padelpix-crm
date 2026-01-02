import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DmTemplate } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useDmTemplates() {
  return useQuery({
    queryKey: ['dm_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dm_templates')
        .select('*')
        .order('use_count', { ascending: false });
      
      if (error) throw error;
      return data as DmTemplate[];
    },
  });
}

interface CreateTemplateData {
  template_name: string;
  template_body: string;
  template_type?: string;
  variables?: string[];
}

export function useCreateDmTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: CreateTemplateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('dm_templates')
        .insert({
          template_name: template.template_name,
          template_body: template.template_body,
          template_type: template.template_type,
          variables: template.variables,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm_templates'] });
      toast({ title: 'Template created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create template', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateDmTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('dm_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm_templates'] });
      toast({ title: 'Template updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update template', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteDmTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dm_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm_templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete template', description: error.message, variant: 'destructive' });
    },
  });
}

export function useIncrementTemplateUse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: template } = await supabase
        .from('dm_templates')
        .select('use_count')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('dm_templates')
        .update({ 
          use_count: (template?.use_count || 0) + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm_templates'] });
    },
  });
}