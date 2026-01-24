-- Add country field to ownership_groups table
ALTER TABLE public.ownership_groups 
ADD COLUMN country text DEFAULT 'South Africa';