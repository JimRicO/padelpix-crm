-- Insert default tasks for all existing clubs
INSERT INTO tasks (club_id, title, description, priority, created_by)
SELECT 
  c.id,
  t.title,
  t.description,
  'medium'::priority_level,
  c.created_by
FROM clubs c
CROSS JOIN (
  VALUES 
    ('Database collection', 'Verify that all fields have been collected'),
    ('Logo collection', 'Collect the club''s logo'),
    ('Following', 'Follow the club on social media'),
    ('Engaging', 'Engage with the club''s content (likes/comments)'),
    ('Content creation', 'Create content for the club'),
    ('DM', 'Send a direct message to the club')
) AS t(title, description);

-- Function to create default tasks for new clubs
CREATE OR REPLACE FUNCTION public.create_default_club_tasks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tasks (club_id, title, description, priority, created_by)
  VALUES
    (NEW.id, 'Database collection', 'Verify that all fields have been collected', 'medium', NEW.created_by),
    (NEW.id, 'Logo collection', 'Collect the club''s logo', 'medium', NEW.created_by),
    (NEW.id, 'Following', 'Follow the club on social media', 'medium', NEW.created_by),
    (NEW.id, 'Engaging', 'Engage with the club''s content (likes/comments)', 'medium', NEW.created_by),
    (NEW.id, 'Content creation', 'Create content for the club', 'medium', NEW.created_by),
    (NEW.id, 'DM', 'Send a direct message to the club', 'medium', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to fire after club insert
CREATE TRIGGER on_club_created
  AFTER INSERT ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_club_tasks();