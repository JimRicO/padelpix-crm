-- Create events table for festivals, conferences, fairs
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'conference', -- festival, conference, fair, exhibition, tournament, other
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, attending, attended, cancelled, interested
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  city TEXT,
  country TEXT,
  website TEXT,
  description TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_people junction table for linking events to people
CREATE TABLE public.event_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'met_at', -- met_at, speaker, organizer, exhibitor, plan_to_meet
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, person_id)
);

-- Create event_clubs junction table for linking events to clubs
CREATE TABLE public.event_clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'exhibitor', -- exhibitor, sponsor, attendee, organizer
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, club_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_clubs ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Users can view their own events" ON public.events FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for event_people
CREATE POLICY "Users can view their own event_people" ON public.event_people FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own event_people" ON public.event_people FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own event_people" ON public.event_people FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own event_people" ON public.event_people FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for event_clubs
CREATE POLICY "Users can view their own event_clubs" ON public.event_clubs FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own event_clubs" ON public.event_clubs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own event_clubs" ON public.event_clubs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own event_clubs" ON public.event_clubs FOR DELETE USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();