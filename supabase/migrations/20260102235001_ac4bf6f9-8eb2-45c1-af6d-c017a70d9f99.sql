-- Add ownership_group field to clubs table for grouping clubs under same ownership
ALTER TABLE public.clubs ADD COLUMN ownership_group text;