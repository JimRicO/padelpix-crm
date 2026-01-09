-- Create ownership_groups table
CREATE TABLE public.ownership_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  logo_url text,
  brand_color text,
  website text,
  relationship_status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.ownership_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ownership groups"
ON public.ownership_groups
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create ownership groups"
ON public.ownership_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own ownership groups"
ON public.ownership_groups
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own ownership groups"
ON public.ownership_groups
FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_ownership_groups_updated_at
BEFORE UPDATE ON public.ownership_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();