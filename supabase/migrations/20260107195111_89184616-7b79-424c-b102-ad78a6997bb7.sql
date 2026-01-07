-- Add new enum values (must be committed before use)
ALTER TYPE club_tier ADD VALUE IF NOT EXISTS 'group_owned';
ALTER TYPE club_tier ADD VALUE IF NOT EXISTS 'large';