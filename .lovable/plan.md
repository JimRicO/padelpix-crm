
# Add Country Field to All Cards

## Overview
Update all card components across the system to display the country field. Since most data defaults to "South Africa", cards will show this value consistently.

## Cards to Update

### 1. ClubCard (src/components/pipeline/ClubCard.tsx)
**Current state:** Shows city with MapPin icon but no country
**Change:** Add country display alongside or below city

Display format:
```
📍 Johannesburg, South Africa
```

### 2. ClubCardCompact (src/components/pipeline/ClubCardCompact.tsx)
**Current state:** Minimal view with just club name and crown icon
**Change:** This is intentionally compact for converted clubs - no country needed here

### 3. EnterpriseGroupCard (src/components/pipeline/EnterpriseGroupCard.tsx)
**Current state:** Shows group name, club count, courts, DMs
**Change:** Add country indicator in the stats row

Display format:
```
3 clubs | 🏗️ 12 | 📍 South Africa
```

### 4. OrganizationCard (src/components/organizations/OrganizationCard.tsx)
**Current state:** Shows logo, name, status, club count, contact info
**Change:** Add country display with MapPin icon in the info section

Display format:
```
📍 South Africa
```

### 5. PersonCard (src/components/people/PersonCard.tsx)
**Current state:** Already displays country with MapPin icon
**No changes needed**

---

## Implementation Details

### ClubCard Changes
- Modify the location display (around line 67-72)
- Show format: `{city}, {country || 'South Africa'}`
- If no city, just show country

### EnterpriseGroupCard Changes
- Add country to the stats row (around line 101-119)
- Use MapPin icon with "South Africa" text
- Only show in expanded view (not compact)

### OrganizationCard Changes
- Add country display after the club count section
- Use MapPin icon consistent with other cards
- Default to "South Africa" if country is null

---

## Files to Modify
1. `src/components/pipeline/ClubCard.tsx` - Add country to location display
2. `src/components/pipeline/EnterpriseGroupCard.tsx` - Add country to stats
3. `src/components/organizations/OrganizationCard.tsx` - Add country field display

## No Changes Needed
- `src/components/pipeline/ClubCardCompact.tsx` - Intentionally minimal
- `src/components/people/PersonCard.tsx` - Already shows country
