-- Add column to track active research job
ALTER TABLE public.people 
ADD COLUMN enrichment_job_id text DEFAULT NULL;

-- Add column to track job status
ALTER TABLE public.people 
ADD COLUMN enrichment_status text DEFAULT NULL;