

## Extend Ownership Groups for Enrichment Data

### Overview
Extend the `ownership_groups` table to store enrichment data returned from the enrichment platform, then update the UI to display the new fields and retrieve enrichment results.

### Database Schema Extension

Add the following columns to `ownership_groups`:

| Field | Type | Description |
|-------|------|-------------|
| `description` | text | AI-generated organization description |
| `instagram_handle` | text | Instagram handle |
| `instagram_followers` | integer | Follower count |
| `instagram_bio` | text | Instagram biography |
| `address` | text | Physical address |
| `color_palette` | jsonb | `{ primary, secondary, accent, background }` |
| `fonts` | jsonb | `{ primary, heading }` |
| `attitude` | text | AI-analyzed brand attitude |
| `aesthetics` | text | AI-analyzed visual aesthetics |
| `perplexity_description` | text | Perplexity AI research description |
| `founder_info` | text | Founder/leadership information |
| `founding_year` | text | Year founded |
| `recent_activities` | jsonb | Recent news/activities array |
| `perplexity_citations` | text[] | Source URLs from research |
| `enrichment_job_id` | text | Last enrichment job ID |
| `enrichment_status` | text | `pending`, `processing`, `completed`, `failed` |
| `enriched_at` | timestamptz | When enrichment completed |

### Implementation Steps

#### Step 1: Database Migration
Run a migration to add all new columns to the `ownership_groups` table with appropriate defaults and nullable settings.

#### Step 2: Update TypeScript Interface
Modify `useOwnershipGroups.ts` to include the new fields in the `OwnershipGroup` interface.

#### Step 3: Create Enrichment Retrieval Edge Function
Create `get-enrichment-results` edge function that:
- Accepts a `job_id` parameter
- Calls the external `api-get-enrichment-status` endpoint to check status
- When complete, calls `api-get-clubs?job_id=...` to fetch results
- Returns the enriched data

#### Step 4: Update Enrich Button Flow
Modify `OrganizationCard.tsx` to:
- Store the `job_id` when enrichment is submitted
- Save `enrichment_job_id` and `enrichment_status` to the database
- Show a visual indicator when enrichment is pending/processing

#### Step 5: Create Polling Hook
Create `useEnrichmentStatus` hook that:
- Polls the enrichment status endpoint periodically (every 30 seconds)
- Updates the database when enrichment completes
- Invalidates queries to refresh the UI

#### Step 6: Create Results Retrieval Function
Create `apply-enrichment-results` edge function that:
- Fetches results from the enrichment platform
- Maps enrichment fields to `ownership_groups` columns
- Updates the database with enriched data
- Updates `enriched_at` timestamp

#### Step 7: Update OrganizationCard Display
Enhance the card to show:
- Instagram handle with follower count (if available)
- Brand attitude/aesthetics tags
- Founding year
- Enrichment status indicator (sparkle icon with status)

#### Step 8: Update OwnershipGroupModal
Add new sections to display:
- **Brand Identity**: Color palette swatches, fonts, attitude, aesthetics
- **Research**: Perplexity description with citations
- **History**: Founder info, founding year, recent activities
- **Social**: Instagram handle, bio, followers

### Technical Details

```text
Database Changes:
+----------------------------+
| ownership_groups           |
+----------------------------+
| + description              |
| + instagram_handle         |
| + instagram_followers      |
| + instagram_bio            |
| + address                  |
| + color_palette (jsonb)    |
| + fonts (jsonb)            |
| + attitude                 |
| + aesthetics               |
| + perplexity_description   |
| + founder_info             |
| + founding_year            |
| + recent_activities (jsonb)|
| + perplexity_citations[]   |
| + enrichment_job_id        |
| + enrichment_status        |
| + enriched_at              |
+----------------------------+
```

### Files to Modify/Create

1. **Database Migration** - Add new columns
2. `src/hooks/useOwnershipGroups.ts` - Update interface
3. `supabase/functions/get-enrichment-results/index.ts` - New edge function
4. `supabase/functions/apply-enrichment-results/index.ts` - New edge function
5. `src/hooks/useEnrichmentStatus.ts` - New polling hook
6. `src/components/organizations/OrganizationCard.tsx` - Update display
7. `src/components/group/OwnershipGroupModal.tsx` - Add new sections

### Expected Outcome
After enrichment completes, organization cards will display rich data including Instagram stats, brand identity, founding information, and AI-generated descriptions. The modal will show detailed research findings with citations.

