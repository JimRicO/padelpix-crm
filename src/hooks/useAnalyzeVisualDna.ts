 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from '@/hooks/use-toast';
 
 interface AnalyzeResult {
   success: boolean;
   message?: string;
   visual_dna?: unknown;
   voice_dna?: unknown;
   ctlt_matches?: unknown;
   invisibility_score?: number | null;
   invisibility_category?: string | null;
   analyzed_at?: string;
   error?: string;
 }
 
 export function useAnalyzeVisualDna() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (clubId: string): Promise<AnalyzeResult> => {
       const { data, error } = await supabase.functions.invoke('analyze-club-visual-dna', {
         body: { club_id: clubId },
       });
 
       if (error) {
         throw new Error(error.message);
       }
 
       if (!data.success) {
         throw new Error(data.error || 'Failed to analyze Visual DNA');
       }
 
       return data;
     },
     onSuccess: (data) => {
       const scoreText = data.invisibility_score !== null && data.invisibility_score !== undefined
         ? `Invisibility Score: ${data.invisibility_score}`
         : '';
       const categoryText = data.invisibility_category 
         ? ` (${data.invisibility_category})`
         : '';
       
       toast({
         title: 'Visual DNA Analyzed',
         description: scoreText + categoryText || data.message || 'Analysis complete',
       });
       
       // Invalidate clubs query to refresh data
       queryClient.invalidateQueries({ queryKey: ['clubs'] });
       queryClient.invalidateQueries({ queryKey: ['club'] });
     },
     onError: (error: Error) => {
       toast({
         title: 'Visual DNA Analysis Failed',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 }