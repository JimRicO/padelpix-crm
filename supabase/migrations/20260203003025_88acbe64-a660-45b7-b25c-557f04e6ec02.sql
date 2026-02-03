-- Add enrichment tracking fields to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS enrichment_job_id TEXT,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT,
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP WITH TIME ZONE;