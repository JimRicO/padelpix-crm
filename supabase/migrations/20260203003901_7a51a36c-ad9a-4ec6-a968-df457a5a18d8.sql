-- Add color_palette and additional enrichment fields to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS color_palette JSONB,
ADD COLUMN IF NOT EXISTS fonts JSONB,
ADD COLUMN IF NOT EXISTS attitude TEXT,
ADD COLUMN IF NOT EXISTS aesthetics TEXT,
ADD COLUMN IF NOT EXISTS founder_info TEXT,
ADD COLUMN IF NOT EXISTS founding_year TEXT,
ADD COLUMN IF NOT EXISTS perplexity_description TEXT,
ADD COLUMN IF NOT EXISTS perplexity_citations TEXT[];