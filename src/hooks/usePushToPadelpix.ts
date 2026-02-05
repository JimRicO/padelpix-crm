 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from '@/hooks/use-toast';
 
 interface PushResult {
   success: boolean;
   message?: string;
   club_profile_id?: string;
   pushed_at?: string;
   error?: string;
 }
 
 export function usePushToPadelpix() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (clubId: string): Promise<PushResult> => {
       const { data, error } = await supabase.functions.invoke('push-to-padelpix', {
         body: { club_id: clubId },
       });
 
       if (error) {
         throw new Error(error.message);
       }
 
       if (!data.success) {
         throw new Error(data.error || 'Failed to push to PadelPix');
       }
 
       return data;
     },
     onSuccess: (data) => {
       toast({
         title: 'Pushed to PadelPix',
         description: data.message || 'Club successfully synced',
       });
       // Invalidate clubs query to refresh data
       queryClient.invalidateQueries({ queryKey: ['clubs'] });
       queryClient.invalidateQueries({ queryKey: ['club'] });
     },
     onError: (error: Error) => {
       toast({
         title: 'Push Failed',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 }