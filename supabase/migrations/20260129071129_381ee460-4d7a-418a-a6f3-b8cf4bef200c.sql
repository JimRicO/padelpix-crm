-- Add new fields to clubs table for extended club data

-- Contact & Location
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS google_maps_url text;

-- Social Media
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS twitter text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS insta_url text;

-- Instagram Metrics
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS insta_bio text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS insta_followers integer;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS avg_likes integer;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS avg_comments integer;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS avg_video_views integer;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS top_hashtags text[];

-- Key People
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS key_individuals text[];