-- Create agenda_events table
CREATE TABLE public.agenda_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_time TIME WITHOUT TIME ZONE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'manual',
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint for event_type
ALTER TABLE public.agenda_events
ADD CONSTRAINT agenda_events_event_type_check 
CHECK (event_type IN ('manual', 'system'));

-- Enable Row Level Security
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own events
CREATE POLICY "Users can view their own events"
ON public.agenda_events
FOR SELECT
USING (auth.uid() = created_by);

-- RLS Policy: Users can create their own events
CREATE POLICY "Users can create their own events"
ON public.agenda_events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- RLS Policy: Users can update their own events
CREATE POLICY "Users can update their own events"
ON public.agenda_events
FOR UPDATE
USING (auth.uid() = created_by);

-- RLS Policy: Users can delete their own events
CREATE POLICY "Users can delete their own events"
ON public.agenda_events
FOR DELETE
USING (auth.uid() = created_by);

-- Create index for faster date-based queries
CREATE INDEX idx_agenda_events_date ON public.agenda_events(event_date);
CREATE INDEX idx_agenda_events_created_by ON public.agenda_events(created_by);