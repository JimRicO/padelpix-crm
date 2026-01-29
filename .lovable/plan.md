

# Plan: Add Intelligent Fuzzy Column Matching to CSV Import

## Problem
The current column matching is too strict. Your CSV has columns like:
- `Club_Name` → should match `club_name` ✗ (not matching)
- `Business Description` → should match `business_description` ✗
- `Phone Number` → should match `phone` ✗  
- `Location 1 Address` → should match `address` ✗
- `Team Members (Basic)` → should match `key_individuals` ✗
- `Number of Courts` → should match `number_of_courts` ✗

The system only does exact lowercase+underscore matching, which misses obvious variations.

---

## Solution: Smart Fuzzy Matching

Add a multi-layer matching strategy that tries progressively looser matching:

### Layer 1: Exact Match (current)
`phone` → `phone`

### Layer 2: Normalized Match
Remove spaces, underscores, parentheses, numbers, and compare:
`Phone Number` → `phonenumber` → matches `phone`
`Business Description` → `businessdescription` → matches `business_description`

### Layer 3: Keyword Contains Match
Check if column contains a key term:
- Contains "phone" → `phone`
- Contains "address" → `address`  
- Contains "instagram" or "insta" → `instagram_handle`
- Contains "facebook" or "fb" → `facebook`
- Contains "courts" → `number_of_courts`
- Contains "description" → `business_description`
- Contains "team" or "members" or "individuals" → `key_individuals`
- Contains "location" + "name" → `club_name` (for multi-location imports)

### Layer 4: Semantic Aliases
Map common business terminology:
- "team members" → `key_individuals`
- "contact number" → `phone`
- "mobile" → `phone`
- "email address" → `email`
- "web" → `website`
- "insta" → `instagram_handle`

---

## Changes to ImportDialog.tsx

### 1. Add Smart Matching Function
```typescript
const smartMatchColumn = (header: string): { field: string; display: string } | null => {
  const original = header.trim();
  const lower = original.toLowerCase();
  const normalized = lower.replace(/[^a-z]/g, ''); // remove all non-letters
  
  // Layer 1: Exact match in FIELD_MAP
  if (FIELD_MAP[lower.replace(/\s+/g, '_')]) {
    return FIELD_MAP[lower.replace(/\s+/g, '_')];
  }
  
  // Layer 2: Keyword matching
  const keywordRules = [
    { keywords: ['club', 'name'], field: 'club_name' },
    { keywords: ['phone', 'mobile', 'tel'], field: 'phone' },
    { keywords: ['email'], field: 'email' },
    { keywords: ['address'], field: 'address' },
    { keywords: ['court'], field: 'number_of_courts' },
    { keywords: ['instagram', 'insta', 'ig'], field: 'instagram_handle' },
    { keywords: ['facebook', 'fb'], field: 'facebook' },
    { keywords: ['linkedin'], field: 'linkedin' },
    { keywords: ['twitter', 'x.com'], field: 'twitter' },
    { keywords: ['whatsapp', 'wa'], field: 'whatsapp' },
    { keywords: ['website', 'url', 'web'], field: 'website' },
    { keywords: ['description', 'bio', 'about'], field: 'business_description' },
    { keywords: ['team', 'member', 'individual', 'staff', 'people'], field: 'key_individuals' },
    { keywords: ['country'], field: 'country' },
    { keywords: ['city'], field: 'city' },
  ];
  
  for (const rule of keywordRules) {
    if (rule.keywords.some(kw => normalized.includes(kw))) {
      return { field: rule.field, display: FIELD_DISPLAY[rule.field] };
    }
  }
  
  return null;
};
```

### 2. Update analyzeHeaders Function
Replace the current strict matching with the smart matcher.

### 3. Handle "Location 1" Prefix Pattern
For multi-location CSVs, strip "location 1", "location 2" prefixes:
- `Location 1 Address` → `address`
- `Location 1 Phone` → `phone`
- `Location 1 Name` → `club_name` (treat as the name for first location)

### 4. Update parseCSV to Use Smart Matching
Apply the same smart matching when parsing values.

---

## Expected Results After Change

Your columns will match:

| CSV Header | Matched Field |
|------------|---------------|
| Club_Name | club_name |
| Business Description | business_description |
| Team Members (Basic) | key_individuals |
| Phone Number | phone |
| Email Address | email |
| Number of Courts | number_of_courts |
| Location 1 Name | club_name |
| Location 1 Address | address |
| Location 1 Phone | phone |
| Instagram | instagram_handle |
| Facebook | facebook |
| LinkedIn | linkedin |
| Website | website |
| Country | country |

---

## Technical Details

**File:** `src/components/import/ImportDialog.tsx`

- Add `smartMatchColumn()` function with keyword-based matching
- Add `FIELD_DISPLAY` lookup for display names
- Update `analyzeHeaders()` to use smart matching
- Update `parseCSV()` to use smart matching for values
- Add "Location N" prefix stripping logic
- Keep backward compatibility with exact matches

