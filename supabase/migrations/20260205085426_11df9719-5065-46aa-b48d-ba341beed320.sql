-- Add visual_dna_media_urls column to store Instagram image URLs from GTM analysis
ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS visual_dna_media_urls JSONB DEFAULT NULL;