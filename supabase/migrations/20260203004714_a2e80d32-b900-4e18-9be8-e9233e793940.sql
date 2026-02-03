-- Add missing enrichment columns to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS recent_activities JSONB,
ADD COLUMN IF NOT EXISTS instagram_profile_pic_url TEXT;