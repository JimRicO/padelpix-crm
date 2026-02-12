
-- Add key_people (structured JSONB) and key_individuals (names array) to ownership_groups
ALTER TABLE public.ownership_groups 
  ADD COLUMN IF NOT EXISTS key_people jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS key_individuals text[] DEFAULT NULL;
