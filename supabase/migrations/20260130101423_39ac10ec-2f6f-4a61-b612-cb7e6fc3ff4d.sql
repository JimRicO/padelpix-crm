-- Drop the overly permissive policy and replace with a proper one
DROP POLICY IF EXISTS "System can insert suggestions via trigger" ON person_link_suggestions;

-- The trigger function runs as SECURITY DEFINER which bypasses RLS
-- So we don't actually need an INSERT policy for the trigger
-- The existing RLS policies for SELECT/UPDATE/DELETE are sufficient