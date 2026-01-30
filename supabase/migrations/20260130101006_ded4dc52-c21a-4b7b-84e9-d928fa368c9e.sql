-- Function to generate person link suggestions based on email domain and contact name matches
CREATE OR REPLACE FUNCTION public.generate_person_link_suggestions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  person_email_domain TEXT;
  club_record RECORD;
  org_record RECORD;
BEGIN
  -- Clear existing pending suggestions for this person (to regenerate fresh)
  DELETE FROM person_link_suggestions 
  WHERE person_id = NEW.id AND status = 'pending';

  -- Extract email domain if email exists
  IF NEW.email IS NOT NULL AND NEW.email LIKE '%@%' THEN
    person_email_domain := lower(split_part(NEW.email, '@', 2));
  END IF;

  -- Match against clubs by email domain (website contains the domain)
  IF person_email_domain IS NOT NULL THEN
    FOR club_record IN 
      SELECT id, club_name, website 
      FROM clubs 
      WHERE website IS NOT NULL 
        AND lower(website) LIKE '%' || person_email_domain || '%'
        AND created_by = NEW.created_by
    LOOP
      -- Check if link doesn't already exist
      IF NOT EXISTS (
        SELECT 1 FROM person_links 
        WHERE person_id = NEW.id AND club_id = club_record.id
      ) THEN
        INSERT INTO person_link_suggestions (person_id, link_type, club_id, match_reason)
        VALUES (NEW.id, 'club', club_record.id, 
          'Email domain "' || person_email_domain || '" matches club website');
      END IF;
    END LOOP;
  END IF;

  -- Match against clubs by contact name
  IF NEW.full_name IS NOT NULL THEN
    FOR club_record IN 
      SELECT id, club_name, contact_name 
      FROM clubs 
      WHERE contact_name IS NOT NULL 
        AND lower(contact_name) = lower(NEW.full_name)
        AND created_by = NEW.created_by
    LOOP
      -- Check if link doesn't already exist and suggestion doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM person_links 
        WHERE person_id = NEW.id AND club_id = club_record.id
      ) AND NOT EXISTS (
        SELECT 1 FROM person_link_suggestions 
        WHERE person_id = NEW.id AND club_id = club_record.id AND status = 'pending'
      ) THEN
        INSERT INTO person_link_suggestions (person_id, link_type, club_id, match_reason)
        VALUES (NEW.id, 'club', club_record.id, 
          'Name matches club contact "' || club_record.contact_name || '"');
      END IF;
    END LOOP;
  END IF;

  -- Match against ownership groups by email domain (website contains the domain)
  IF person_email_domain IS NOT NULL THEN
    FOR org_record IN 
      SELECT id, name, website 
      FROM ownership_groups 
      WHERE website IS NOT NULL 
        AND lower(website) LIKE '%' || person_email_domain || '%'
        AND created_by = NEW.created_by
    LOOP
      -- Check if link doesn't already exist
      IF NOT EXISTS (
        SELECT 1 FROM person_links 
        WHERE person_id = NEW.id AND ownership_group_name = org_record.name
      ) THEN
        INSERT INTO person_link_suggestions (person_id, link_type, ownership_group_name, match_reason)
        VALUES (NEW.id, 'ownership_group', org_record.name, 
          'Email domain "' || person_email_domain || '" matches organization website');
      END IF;
    END LOOP;
  END IF;

  -- Match against ownership groups by contact name
  IF NEW.full_name IS NOT NULL THEN
    FOR org_record IN 
      SELECT id, name, contact_name 
      FROM ownership_groups 
      WHERE contact_name IS NOT NULL 
        AND lower(contact_name) = lower(NEW.full_name)
        AND created_by = NEW.created_by
    LOOP
      -- Check if link doesn't already exist and suggestion doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM person_links 
        WHERE person_id = NEW.id AND ownership_group_name = org_record.name
      ) AND NOT EXISTS (
        SELECT 1 FROM person_link_suggestions 
        WHERE person_id = NEW.id AND ownership_group_name = org_record.name AND status = 'pending'
      ) THEN
        INSERT INTO person_link_suggestions (person_id, link_type, ownership_group_name, match_reason)
        VALUES (NEW.id, 'ownership_group', org_record.name, 
          'Name matches organization contact "' || org_record.contact_name || '"');
      END IF;
    END LOOP;
  END IF;

  -- Match against ownership groups by contact email
  IF NEW.email IS NOT NULL THEN
    FOR org_record IN 
      SELECT id, name, contact_email 
      FROM ownership_groups 
      WHERE contact_email IS NOT NULL 
        AND lower(contact_email) = lower(NEW.email)
        AND created_by = NEW.created_by
    LOOP
      -- Check if link doesn't already exist and suggestion doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM person_links 
        WHERE person_id = NEW.id AND ownership_group_name = org_record.name
      ) AND NOT EXISTS (
        SELECT 1 FROM person_link_suggestions 
        WHERE person_id = NEW.id AND ownership_group_name = org_record.name AND status = 'pending'
      ) THEN
        INSERT INTO person_link_suggestions (person_id, link_type, ownership_group_name, match_reason)
        VALUES (NEW.id, 'ownership_group', org_record.name, 
          'Email matches organization contact email');
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on people table
DROP TRIGGER IF EXISTS generate_person_suggestions_trigger ON people;
CREATE TRIGGER generate_person_suggestions_trigger
  AFTER INSERT OR UPDATE OF full_name, email
  ON people
  FOR EACH ROW
  EXECUTE FUNCTION generate_person_link_suggestions();

-- Add INSERT policy for person_link_suggestions (needed for the trigger)
CREATE POLICY "System can insert suggestions via trigger"
  ON person_link_suggestions
  FOR INSERT
  WITH CHECK (true);