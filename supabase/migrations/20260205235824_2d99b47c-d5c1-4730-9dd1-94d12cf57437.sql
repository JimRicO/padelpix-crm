-- First, let's see the duplicate records to decide which to keep
-- We'll keep the one with more data or the oldest one

-- Delete duplicate people (keep the one with the earliest created_at)
DELETE FROM people 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(full_name)) ORDER BY created_at ASC) as rn
    FROM people
  ) t 
  WHERE rn > 1
);

-- Create a unique index on lowercase trimmed full_name to prevent future duplicates
CREATE UNIQUE INDEX idx_people_unique_name ON people (LOWER(TRIM(full_name)));