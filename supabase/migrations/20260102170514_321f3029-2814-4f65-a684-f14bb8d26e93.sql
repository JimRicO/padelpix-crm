-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for pipeline stages
CREATE TYPE public.pipeline_stage AS ENUM (
  'not_contacted', 'followed', 'engaged', 'dm_sent', 
  'responded', 'content_created', 'trial', 'customer', 'dead'
);

-- Create enum for priority
CREATE TYPE public.priority_level AS ENUM ('high', 'medium', 'low');

-- Create enum for club tier
CREATE TYPE public.club_tier AS ENUM ('enterprise', 'multi_court', 'boutique');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name TEXT NOT NULL,
  instagram_handle TEXT,
  city TEXT,
  country TEXT DEFAULT 'South Africa',
  website TEXT,
  whatsapp TEXT,
  email TEXT,
  number_of_courts INTEGER,
  address TEXT,
  
  pipeline_stage pipeline_stage DEFAULT 'not_contacted',
  
  followed_date TIMESTAMPTZ,
  first_comment_date TIMESTAMPTZ,
  first_dm_date TIMESTAMPTZ,
  first_response_date TIMESTAMPTZ,
  content_created_date TIMESTAMPTZ,
  trial_start_date TIMESTAMPTZ,
  converted_date TIMESTAMPTZ,
  
  total_comments INTEGER DEFAULT 0,
  total_dms INTEGER DEFAULT 0,
  total_content_pieces INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  
  notes TEXT,
  contact_name TEXT,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  
  tier club_tier,
  priority priority_level DEFAULT 'medium',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create content_pieces table
CREATE TABLE public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  
  style TEXT,
  dimensions TEXT,
  
  created_date TIMESTAMPTZ DEFAULT NOW(),
  sent_date TIMESTAMPTZ,
  club_response TEXT,
  status TEXT DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create dm_templates table
CREATE TABLE public.dm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  template_name TEXT NOT NULL,
  template_type TEXT,
  template_body TEXT NOT NULL,
  variables TEXT[],
  
  use_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT,
  priority priority_level DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_clubs_pipeline_stage ON public.clubs(pipeline_stage);
CREATE INDEX idx_clubs_next_action_date ON public.clubs(next_action_date);
CREATE INDEX idx_clubs_instagram_handle ON public.clubs(instagram_handle);
CREATE INDEX idx_clubs_created_by ON public.clubs(created_by);
CREATE INDEX idx_activities_club_id ON public.activities(club_id);
CREATE INDEX idx_activities_date ON public.activities(activity_date DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);
CREATE INDEX idx_content_club_id ON public.content_pieces(club_id);
CREATE INDEX idx_content_status ON public.content_pieces(status);
CREATE INDEX idx_tasks_club_id ON public.tasks(club_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for clubs
CREATE POLICY "Users can view their own clubs"
  ON public.clubs FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create clubs"
  ON public.clubs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clubs"
  ON public.clubs FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own clubs"
  ON public.clubs FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for activities
CREATE POLICY "Users can view activities for their clubs"
  ON public.activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = activities.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can create activities for their clubs"
  ON public.activities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = activities.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can update activities for their clubs"
  ON public.activities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = activities.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete activities for their clubs"
  ON public.activities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = activities.club_id 
    AND clubs.created_by = auth.uid()
  ));

-- RLS Policies for content_pieces
CREATE POLICY "Users can view content for their clubs"
  ON public.content_pieces FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = content_pieces.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can create content for their clubs"
  ON public.content_pieces FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = content_pieces.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can update content for their clubs"
  ON public.content_pieces FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = content_pieces.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete content for their clubs"
  ON public.content_pieces FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = content_pieces.club_id 
    AND clubs.created_by = auth.uid()
  ));

-- RLS Policies for dm_templates
CREATE POLICY "Users can view their own templates"
  ON public.dm_templates FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates"
  ON public.dm_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON public.dm_templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates"
  ON public.dm_templates FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks for their clubs"
  ON public.tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = tasks.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can create tasks for their clubs"
  ON public.tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = tasks.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can update tasks for their clubs"
  ON public.tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = tasks.club_id 
    AND clubs.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete tasks for their clubs"
  ON public.tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE clubs.id = tasks.club_id 
    AND clubs.created_by = auth.uid()
  ));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dm_templates_updated_at
  BEFORE UPDATE ON public.dm_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();