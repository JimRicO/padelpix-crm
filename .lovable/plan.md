
# Auto-Sync Missing Organizations

## Overview
Implement automatic synchronization that creates `ownership_groups` records for any ownership group names found in the clubs table that don't already have a matching organization entry.

## Current State
- **14 unique ownership groups** exist in clubs data
- **Only 4 organization records** exist in the `ownership_groups` table
- **10 organizations are missing**: Africa Padel, Balwin, Club Padel, Net Set Padel, Padel & Social Club, Padel Lab, Padel Nation, Proactive Padel, ProPadel, Techno Padel, Ten By Twenty

## Implementation Approach

### Option A: One-Time Sync Button (Recommended)
Add a "Sync Missing" button on the Organizations page that:
1. Compares ownership group names from clubs vs existing organization records
2. Creates new organization records for any missing ones
3. Shows a toast with results (e.g., "Created 10 missing organizations")

### Option B: Automatic Background Sync
Automatically sync when the Organizations page loads or when clubs data changes.

**I recommend Option A** because it gives you control and visibility into when syncing happens.

---

## Implementation Steps

### 1. Create New Hook: `useSyncMissingOrganizations`
**File:** `src/hooks/useOwnershipGroups.ts`

Add a new mutation hook that:
- Gets all unique ownership group names from clubs
- Gets all existing organization names
- Identifies missing ones
- Bulk inserts the missing organizations with default values

```text
Logic flow:
Clubs Data → Extract unique ownership_group names
                        ↓
Ownership Groups → Extract existing names
                        ↓
Compare → Find missing names
                        ↓
Bulk Insert → Create records for missing names
```

### 2. Update Organizations Page
**File:** `src/pages/Organizations.tsx`

Add:
- Import the new sync hook
- Add a "Sync Missing" button in the header (only visible when missing orgs exist)
- Show badge with count of missing organizations
- Call sync mutation on button click

### 3. UI/UX Details
- Button placement: Next to "Add Organization" button
- Button style: Secondary/outline to differentiate from primary action
- Badge: Show count of missing organizations (e.g., "Sync 10 Missing")
- Loading state: Show spinner while syncing
- Success toast: "Successfully created X organizations"

---

## Technical Details

### New Hook Implementation
```typescript
export function useSyncMissingOrganizations() {
  // Mutation that:
  // 1. Fetches distinct ownership_group from clubs
  // 2. Fetches existing organization names  
  // 3. Filters to find missing
  // 4. Bulk inserts missing with: name, relationship_status='active'
}
```

### Files to Modify
1. `src/hooks/useOwnershipGroups.ts` - Add sync mutation hook
2. `src/pages/Organizations.tsx` - Add sync button and logic

### Data Created for Missing Organizations
Each new organization record will have:
- `name`: The ownership group name from clubs
- `relationship_status`: 'active' (default)
- `created_by`: Current user ID
- All other fields: null (can be filled in later via the modal)

---

## Expected Outcome
After clicking "Sync Missing":
- Organizations page will show all 14 organizations (plus RESERVE = 15 total)
- Each organization card will show the correct club count from clubs data
- Users can click any organization to add contact details, logo, etc.
