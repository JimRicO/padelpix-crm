-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'South Africa',
  instagram_handle TEXT,
  linkedin TEXT,
  notes TEXT,
  profile_image TEXT,
  contact_date TIMESTAMP WITH TIME ZONE,
  contact_method TEXT,
  contact_method_other TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on people
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- RLS policies for people
CREATE POLICY "Users can view their own people" ON public.people FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create people" ON public.people FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own people" ON public.people FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own people" ON public.people FOR DELETE USING (auth.uid() = created_by);

-- Create person_links table
CREATE TABLE public.person_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  ownership_group_name TEXT,
  role_at_entity TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on person_links
ALTER TABLE public.person_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for person_links
CREATE POLICY "Users can view their own person links" ON public.person_links FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create person links" ON public.person_links FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own person links" ON public.person_links FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own person links" ON public.person_links FOR DELETE USING (auth.uid() = created_by);

-- Create person_link_suggestions table
CREATE TABLE public.person_link_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  ownership_group_name TEXT,
  match_reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on person_link_suggestions
ALTER TABLE public.person_link_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for person_link_suggestions (based on person ownership)
CREATE POLICY "Users can view suggestions for their people" ON public.person_link_suggestions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.people WHERE people.id = person_link_suggestions.person_id AND people.created_by = auth.uid()));
CREATE POLICY "Users can update suggestions for their people" ON public.person_link_suggestions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.people WHERE people.id = person_link_suggestions.person_id AND people.created_by = auth.uid()));
CREATE POLICY "Users can delete suggestions for their people" ON public.person_link_suggestions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.people WHERE people.id = person_link_suggestions.person_id AND people.created_by = auth.uid()));

-- Create trigger for updated_at on people
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage policies for profile-images bucket
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own profile images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');