-- Fix format_pipeline_stage function to include search_path
CREATE OR REPLACE FUNCTION public.format_pipeline_stage(stage text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT INITCAP(REPLACE(stage, '_', ' '));
$$;