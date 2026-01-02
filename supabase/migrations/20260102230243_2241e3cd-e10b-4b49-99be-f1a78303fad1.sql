-- Add coaches column to clubs table
ALTER TABLE public.clubs 
ADD COLUMN coaches text[] DEFAULT NULL;