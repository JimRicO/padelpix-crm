-- Create function to format pipeline stage names
CREATE OR REPLACE FUNCTION public.format_pipeline_stage(stage text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT INITCAP(REPLACE(stage, '_', ' '));
$$;

-- Create trigger function to log pipeline stage changes
CREATE OR REPLACE FUNCTION public.log_pipeline_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if pipeline_stage actually changed
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    INSERT INTO public.agenda_events (
      event_date,
      event_time,
      title,
      description,
      event_type,
      club_id,
      created_by
    ) VALUES (
      CURRENT_DATE,
      CURRENT_TIME,
      NEW.club_name || ' moved to ' || format_pipeline_stage(NEW.pipeline_stage::text),
      NULL,
      'system',
      NEW.id,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on clubs table
CREATE TRIGGER trigger_log_pipeline_stage_change
AFTER UPDATE OF pipeline_stage ON public.clubs
FOR EACH ROW
EXECUTE FUNCTION public.log_pipeline_stage_change();