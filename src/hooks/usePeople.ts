import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Person } from '@/types/people';

export function usePeople() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['people', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Person[];
    },
    enabled: !!user,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (person: Partial<Person>) => {
      const { data, error } = await supabase
        .from('people')
        .insert({
          full_name: person.full_name!,
          role: person.role,
          email: person.email,
          phone: person.phone,
          country: person.country,
          instagram_handle: person.instagram_handle,
          linkedin: person.linkedin,
          notes: person.notes,
          profile_image: person.profile_image,
          contact_date: person.contact_date,
          contact_method: person.contact_method,
          contact_method_other: person.contact_method_other,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create person: ' + error.message);
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Person> & { id: string }) => {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update person: ' + error.message);
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete person: ' + error.message);
    },
  });
}

interface BulkPersonData {
  full_name: string;
  role?: string;
  email?: string;
  phone?: string;
  country?: string;
  instagram_handle?: string;
  linkedin?: string;
  notes?: string;
  profile_image?: string;
  contact_date?: string;
  contact_method?: string;
}

export function useBulkCreatePeople() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (people: BulkPersonData[]) => {
      if (!user) throw new Error('Not authenticated');
      if (people.length === 0) return { created: 0 };

      const peopleWithUser = people.map(person => ({
        full_name: person.full_name,
        role: person.role,
        email: person.email,
        phone: person.phone,
        country: person.country || 'South Africa',
        instagram_handle: person.instagram_handle,
        linkedin: person.linkedin,
        notes: person.notes,
        profile_image: person.profile_image,
        contact_date: person.contact_date,
        contact_method: person.contact_method,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from('people')
        .insert(peopleWithUser)
        .select();

      if (error) throw error;
      return { created: data.length, data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success(`${result.created} people imported successfully`);
    },
    onError: (error) => {
      toast.error('Failed to import people: ' + error.message);
    },
  });
}
