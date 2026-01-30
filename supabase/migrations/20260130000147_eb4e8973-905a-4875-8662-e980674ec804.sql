-- Add organization_type column to ownership_groups table
ALTER TABLE public.ownership_groups 
ADD COLUMN organization_type TEXT DEFAULT 'commercial';

-- Add check constraint for valid values
ALTER TABLE public.ownership_groups 
ADD CONSTRAINT organization_type_check 
CHECK (organization_type IN ('commercial', 'association'));