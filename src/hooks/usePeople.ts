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
      // Check for existing person with same name (case-insensitive)
      const { data: existing } = await supabase
        .from('people')
        .select('id, full_name')
        .ilike('full_name', person.full_name!.trim())
        .maybeSingle();

      if (existing) {
        throw new Error(`A person named "${existing.full_name}" already exists`);
      }

      const { data, error } = await supabase
        .from('people')
        .insert({
          full_name: person.full_name!.trim(),
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

      if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505') {
          throw new Error('A person with this name already exists');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Person created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
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
      if (people.length === 0) return { created: 0, skipped: 0 };

      // Get existing people names to filter duplicates
      const { data: existingPeople } = await supabase
        .from('people')
        .select('full_name');

      const existingNames = new Set(
        (existingPeople || []).map(p => p.full_name.toLowerCase().trim())
      );

      // Filter out duplicates
      const uniquePeople = people.filter(
        p => !existingNames.has(p.full_name.toLowerCase().trim())
      );
      const skippedCount = people.length - uniquePeople.length;

      if (uniquePeople.length === 0) {
        return { created: 0, skipped: skippedCount };
      }

      const peopleWithUser = uniquePeople.map(person => ({
        full_name: person.full_name.trim(),
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

      if (error) {
        if (error.code === '23505') {
          throw new Error('Some people already exist in your contacts');
        }
        throw error;
      }
      return { created: data.length, skipped: skippedCount, data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      if (result.skipped > 0) {
        toast.success(`${result.created} people imported (${result.skipped} duplicates skipped)`);
      } else {
        toast.success(`${result.created} people imported successfully`);
      }
    },
    onError: (error) => {
      toast.error('Failed to import people: ' + error.message);
    },
  });
}
