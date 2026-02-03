
# Plan: Complete Club Enrichment Parity with Organizations

## Problem
The club enrichment implementation is missing several fields that the API returns and that are already implemented for organizations. Comparing with the organization enrichment (`useEnrichmentStatus.ts` and `EnrichmentSections.tsx`), the club version is incomplete.

## Gap Analysis

### Missing Database Columns
| Field | Type | Purpose |
|-------|------|---------|
| `recent_activities` | JSONB | Array of recent events [{title, date}] |
| `instagram_profile_pic_url` | TEXT | HD profile picture URL |

### Missing Hook Mappings (`useClubEnrichment.ts`)
The hook interface already declares `recent_activities` but doesn't map it to the database. Need to add:
- `recent_activities` → `recent_activities`
- `instagram_profile_pic_url` → new column

### Missing UI Display (`ClubEnrichmentSections.tsx`)
The organization version displays these sections that the club version doesn't:
- **Description section** - shows `business_description`
- **Instagram section** - shows handle, followers, bio (already stored but not shown in enrichment UI)
- **Recent Activities section** - shows up to 3 recent events

## Implementation Steps

### 1. Database Migration
Add missing columns to `clubs` table:
```sql
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS recent_activities JSONB,
ADD COLUMN IF NOT EXISTS instagram_profile_pic_url TEXT;
```

### 2. Update Hook (`src/hooks/useClubEnrichment.ts`)
Add missing field mappings in `applyResultsMutation`:
- Map `enrichmentData.recent_activities` → `updateData.recent_activities`
- Map `enrichmentData.instagram_profile_pic_url` → `updateData.instagram_profile_pic_url`

Update the `EnrichmentStatusResponse` interface to include `instagram_profile_pic_url`.

### 3. Update Type Definition (`src/types/database.ts`)
Add to Club interface:
- `recent_activities: Array<{title?: string; date?: string; description?: string}> | null`
- `instagram_profile_pic_url: string | null`

### 4. Update UI Component (`src/components/club/ClubEnrichmentSections.tsx`)
Mirror the organization `EnrichmentSections.tsx` exactly by adding:

**Description Section:**
```tsx
{club.business_description && (
  <div className="space-y-1">
    <h4 className="text-sm font-medium">Description</h4>
    <p className="text-sm text-muted-foreground">{club.business_description}</p>
  </div>
)}
```

**Instagram Section:**
```tsx
{(club.instagram_handle || club.insta_followers || club.insta_bio) && (
  <div className="space-y-2">
    <h4 className="text-sm font-medium flex items-center gap-2">
      <Instagram className="w-4 h-4" />
      Instagram
    </h4>
    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
      {/* handle link, followers, bio */}
    </div>
  </div>
)}
```

**Recent Activities Section:**
```tsx
{recentActivities && recentActivities.length > 0 && (
  <div className="space-y-2">
    <h4 className="text-sm font-medium">Recent Activities</h4>
    <div className="space-y-2">
      {recentActivities.slice(0, 3).map((activity, i) => (
        <div key={i} className="bg-muted/50 rounded p-2 text-sm">
          {/* title, description, date */}
        </div>
      ))}
    </div>
  </div>
)}
```

### 5. Update hasEnrichmentData Check
Expand the check to include all enrichable fields:
```tsx
const hasEnrichmentData = club.enrichment_status === 'completed' && (
  club.business_description || 
  club.instagram_handle || 
  club.insta_followers ||
  club.color_palette || 
  club.fonts || 
  club.attitude || 
  club.aesthetics ||
  club.founder_info ||
  club.founding_year ||
  club.perplexity_description ||
  club.recent_activities
);
```

## Files to Modify
1. **Database migration** - Add `recent_activities` and `instagram_profile_pic_url` columns
2. `src/hooks/useClubEnrichment.ts` - Add missing field mappings
3. `src/types/database.ts` - Add new fields to Club interface
4. `src/components/club/ClubEnrichmentSections.tsx` - Add Description, Instagram, and Recent Activities sections

## Outcome
Club enrichment will have complete parity with organization enrichment, utilizing all fields returned by the API.
