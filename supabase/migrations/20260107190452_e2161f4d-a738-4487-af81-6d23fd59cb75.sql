-- Add linkedin and logo fields to clubs table
ALTER TABLE public.clubs
ADD COLUMN linkedin text,
ADD COLUMN logo text;

-- Create storage bucket for club logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-logos', 'club-logos', true);

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload club logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'club-logos');

-- Allow public read access to logos
CREATE POLICY "Public can view club logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'club-logos');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their club logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'club-logos');

-- Allow users to delete their uploads
CREATE POLICY "Users can delete their club logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'club-logos');