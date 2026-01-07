-- Migrate existing enterprise clubs with ownership_group to group_owned
UPDATE clubs 
SET tier = 'group_owned' 
WHERE tier = 'enterprise' 
AND ownership_group IS NOT NULL 
AND ownership_group != '';

-- Migrate existing enterprise clubs without ownership_group to large
UPDATE clubs 
SET tier = 'large' 
WHERE tier = 'enterprise' 
AND (ownership_group IS NULL OR ownership_group = '');