-- Add enrichment columns to ownership_groups table
ALTER TABLE public.ownership_groups
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS instagram_followers integer,
  ADD COLUMN IF NOT EXISTS instagram_bio text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS color_palette jsonb,
  ADD COLUMN IF NOT EXISTS fonts jsonb,
  ADD COLUMN IF NOT EXISTS attitude text,
  ADD COLUMN IF NOT EXISTS aesthetics text,
  ADD COLUMN IF NOT EXISTS perplexity_description text,
  ADD COLUMN IF NOT EXISTS founder_info text,
  ADD COLUMN IF NOT EXISTS founding_year text,
  ADD COLUMN IF NOT EXISTS recent_activities jsonb,
  ADD COLUMN IF NOT EXISTS perplexity_citations text[],
  ADD COLUMN IF NOT EXISTS enrichment_job_id text,
  ADD COLUMN IF NOT EXISTS enrichment_status text,
  ADD COLUMN IF NOT EXISTS enriched_at timestamp with time zone;