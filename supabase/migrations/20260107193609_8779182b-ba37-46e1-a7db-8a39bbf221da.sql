-- Consolidate ownership group names to standardized values
UPDATE clubs SET ownership_group = 'Virgin Active' WHERE ownership_group = 'Virgin';
UPDATE clubs SET ownership_group = 'Africa Padel' WHERE ownership_group = 'AfricaPadel';
UPDATE clubs SET ownership_group = 'Balwin' WHERE ownership_group = 'balwin';
UPDATE clubs SET ownership_group = 'Proactive Padel' WHERE ownership_group = 'proactive';