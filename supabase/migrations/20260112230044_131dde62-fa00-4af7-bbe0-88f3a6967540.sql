-- Add total_clubs column to ownership_groups table
ALTER TABLE ownership_groups 
ADD COLUMN total_clubs INTEGER DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN ownership_groups.total_clubs IS 'Manual override for total clubs owned by this group. NULL means use calculated count from imported clubs.';