-- Add suburb column to clubs table
ALTER TABLE public.clubs 
ADD COLUMN suburb text DEFAULT NULL;