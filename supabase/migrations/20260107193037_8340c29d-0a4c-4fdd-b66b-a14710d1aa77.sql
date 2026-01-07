-- Update Virgin Active clubs
UPDATE clubs 
SET ownership_group = 'Virgin Active', tier = 'enterprise'
WHERE club_name ILIKE '%virgin active%' 
AND (ownership_group IS NULL OR ownership_group = '');

-- Update Africa Padel clubs
UPDATE clubs 
SET ownership_group = 'Africa Padel', tier = 'enterprise'
WHERE club_name ILIKE '%africa padel%' 
AND (ownership_group IS NULL OR ownership_group = '');

-- Update Balwin clubs
UPDATE clubs 
SET ownership_group = 'Balwin', tier = 'enterprise'
WHERE club_name ILIKE '%balwin%' 
AND (ownership_group IS NULL OR ownership_group = '');

-- Update Proactive Padel clubs
UPDATE clubs 
SET ownership_group = 'Proactive Padel', tier = 'enterprise'
WHERE club_name ILIKE '%proactive padel%' 
AND (ownership_group IS NULL OR ownership_group = '');