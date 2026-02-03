-- Add key_people JSONB column to clubs table for storing full structured data
ALTER TABLE public.clubs 
ADD COLUMN key_people jsonb DEFAULT NULL;