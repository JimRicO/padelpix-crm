ALTER TABLE public.agenda_events 
ADD COLUMN IF NOT EXISTS end_date date;

ALTER TABLE public.agenda_events 
DROP CONSTRAINT IF EXISTS agenda_events_event_type_check;

ALTER TABLE public.agenda_events 
ADD CONSTRAINT agenda_events_event_type_check 
CHECK (event_type IN ('manual','system','task','industry'));