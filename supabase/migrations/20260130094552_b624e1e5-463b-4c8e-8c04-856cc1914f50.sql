-- Add enrichment_data column to store research results
ALTER TABLE public.people 
ADD COLUMN enrichment_data jsonb DEFAULT NULL;

-- Add enriched_at timestamp to track when research was last run
ALTER TABLE public.people 
ADD COLUMN enriched_at timestamp with time zone DEFAULT NULL;

-- Add index for faster queries on enriched people
CREATE INDEX idx_people_enriched_at ON public.people(enriched_at) WHERE enriched_at IS NOT NULL;