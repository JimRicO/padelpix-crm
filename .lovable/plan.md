
# Visual DNA Analysis Feature Implementation Plan

## Overview

This plan implements a Visual DNA analysis capability in the CRM that allows users to analyze a club's Instagram visual identity directly from the club card. The feature calls the GTM Engine's `analyze-visual-dna` edge function and displays comprehensive results.

## Current Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GTM Engine    │     │   CRM (This     │     │  PadelPix App   │
│ (etscplm...)    │     │    Project)     │     │                 │
│                 │     │                 │     │                 │
│ analyze-visual  │◀────│ analyze-club-   │     │                 │
│ -dna endpoint   │     │ visual-dna (new)│     │                 │
│                 │     │                 │     │                 │
│ Returns:        │     │ Stores:         │     │                 │
│ - visual_dna    │────▶│ - visual_dna    │     │                 │
│ - voice_dna     │     │ - voice_dna     │     │                 │
│ - ctlt_matches  │     │ - ctlt_matches  │     │                 │
│ - invisibility  │     │ - invisibility  │     │                 │
│   score/cat     │     │   score/cat     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Database Schema**: The `clubs` table already has the required columns:
- `visual_dna` (JSONB)
- `voice_dna` (JSONB)
- `ctlt_matches` (JSONB)
- `invisibility_score` (INTEGER)
- `invisibility_category` (TEXT)
- `visual_dna_analyzed_at` (TIMESTAMPTZ)

---

## Implementation Components

### 1. New Edge Function: `analyze-club-visual-dna`

Create `supabase/functions/analyze-club-visual-dna/index.ts`

**Flow:**
1. Accept POST with `{ club_id: string }`
2. Fetch club from CRM database
3. Validate club has Instagram handle and enrichment data
4. Find corresponding enriched club in GTM via `api-get-clubs` (using same pattern as `get-enrichment-status`)
5. Call GTM's `analyze-visual-dna` function with `enriched_club_id`
6. Handle the long-running operation (30-60 seconds) - the GTM function is synchronous
7. Fetch updated enriched club data after analysis completes
8. Store results in CRM `clubs` table
9. Return results to frontend

**Error Handling:**
- No Instagram handle: `"No Instagram handle found. Enrich the club first."`
- No GTM enrichment: `"Club not found in GTM. Run enrichment first."`
- GTM API failures: Propagate meaningful error messages

**API Integration Pattern** (reusing existing pattern):
```typescript
const GTM_BASE = "https://etscplmovnooalqfbzvy.supabase.co/functions/v1";
const CRM_API_KEY = Deno.env.get('CRM_API_KEY');

// Find club in GTM using enrichment_job_id or club_name match
const gtmResponse = await fetch(`${GTM_BASE}/api-get-clubs?job_id=${club.enrichment_job_id}`, {
  headers: { 'x-api-key': CRM_API_KEY }
});

// Trigger Visual DNA analysis
const analyzeResponse = await fetch(`${GTM_BASE}/analyze-visual-dna`, {
  method: 'POST',
  headers: {
    'x-api-key': CRM_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ enriched_club_id: gtmClub.id })
});
```

---

### 2. New React Hook: `useAnalyzeVisualDna`

Create `src/hooks/useAnalyzeVisualDna.ts`

Following the exact pattern from `usePushToPadelpix`:
- React Query mutation wrapping the edge function call
- Success toast showing Invisibility Score and Category
- Error toast with descriptive messages
- Cache invalidation for `['clubs']` and `['club']` queries

---

### 3. TypeScript Types Update

Update `src/types/database.ts` Club interface to include Visual DNA fields that match the database schema (these exist in DB but need TypeScript definitions):

```typescript
// Visual DNA fields (already in DB)
visual_dna: VisualDnaData | null;
voice_dna: VoiceDnaData | null;
ctlt_matches: CtltMatchData | null;
invisibility_score: number | null;
invisibility_category: string | null;
visual_dna_analyzed_at: string | null;
```

Define comprehensive type interfaces for the nested JSONB structures based on GTM's data model.

---

### 4. UI: "Analyze Visual DNA" Button

Update `src/components/club/ClubInfoTab.tsx`

**Button Logic:**
- Show only if club is enriched AND has `instagram_handle`
- Position between "Enrich" and "Push to PadelPix" buttons
- Teal/cyan color to distinguish from Enrich (blue) and Push (orange)

**States:**
| State | Display |
|-------|---------|
| Not analyzed | "Analyze Visual DNA" button (teal) |
| Analyzing | Button with spinner + "Analyzing... (30-60 seconds)" |
| Analyzed | "Visual DNA ✓ [date]" + "Re-analyze" button |

**Confirmation Not Required**: Analysis is non-destructive (additive data), so skip confirmation dialog for initial analysis.

---

### 5. UI: Visual DNA Display Card

Create `src/components/club/VisualDnaCard.tsx`

A comprehensive, collapsible card that displays when `visual_dna` data exists.

**Top-Level Display** (always visible):
- Collapsible trigger showing: "Visual DNA: [Score] [Category Badge] — analyzed [date]"
- Color-coded category badge

**Expanded Sections** (10 detailed sections when expanded):

| Section | Content |
|---------|---------|
| Score Header | Large score number + color-coded badge + analysis date |
| Score Breakdown | Posting frequency (30%), Content quality (25%), Brand consistency (20%), Engagement rate (15%), Caption effort (10%) with individual scores |
| Posting Frequency | Multi-window analysis (30d/90d/12mo), trend indicator, last post date, gap analysis |
| Color Palette | Row of 32px circle swatches with hex labels |
| Photography Style | Badges: primary/secondary style, lighting, saturation, contrast |
| Composition | Shot types, action vs lifestyle ratio, people presence, court visibility |
| Branding Elements | Logo visibility, watermarks, text overlays, templates |
| Content Mix | Horizontal stacked bar chart (Action/Lifestyle/Events/Coaching/Facility/Community/Promotional) |
| Voice Profile | Tone, caption length, emoji usage, hashtag patterns, CTAs, languages, themes |
| CTLT Matches | Top 5 style matches (green badges), styles to avoid (red badges), enhancement suggestions |

**Collapsible Raw JSON**: Debug section showing raw `visual_dna` and `voice_dna` JSON.

**Styling:**
- Uses existing neumorphic design system (`neu-card`, `neu-pressed`, `detail-section`)
- Collapsible via Radix Collapsible primitive
- Score color mapping:
  - Red: 0-19 (Invisible)
  - Orange: 20-39 (Struggling)
  - Yellow: 40-59 (Average)
  - Green: 60-79 (Strong)
  - Blue: 80-100 (Excellent)

---

### 6. Integration into Club Info Tab

Update `src/components/club/ClubInfoTab.tsx` to:

1. Import and use `useAnalyzeVisualDna` hook
2. Add "Analyze Visual DNA" button in the action button row
3. Import and render `VisualDnaCard` component (between ClubEnrichmentSections and Notes section)

**Button Order** (left to right in action bar):
1. Delete Club (destructive, left side)
2. Enrich (blue) - Step 1
3. Analyze Visual DNA (teal) - Step 2, visible only after enrichment
4. Push to PadelPix (orange) - Step 3, visible only after enrichment
5. Save Changes (primary)

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/analyze-club-visual-dna/index.ts` | Edge function for GTM integration |
| `src/hooks/useAnalyzeVisualDna.ts` | React Query mutation hook |
| `src/components/club/VisualDnaCard.tsx` | Comprehensive display component |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add `analyze-club-visual-dna` function config |
| `src/types/database.ts` | Add Visual DNA TypeScript interfaces |
| `src/components/club/ClubInfoTab.tsx` | Add button and integrate VisualDnaCard |

---

## Technical Considerations

### Long-Running Request Handling

The GTM `analyze-visual-dna` function takes 30-60 seconds. The edge function will:
- Use a fetch timeout of 120 seconds
- Show informative loading state on the frontend
- The GTM function is synchronous, so no polling needed

### Data Freshness

- Visual DNA data is stored locally in CRM after analysis
- Re-analysis overwrites previous data
- `visual_dna_analyzed_at` timestamp tracks when analysis occurred

### Error Scenarios

| Scenario | Handling |
|----------|----------|
| No Instagram handle | Block analysis, show error |
| Not enriched in GTM | Block analysis, suggest enrichment first |
| GTM API timeout | Show error, allow retry |
| Rate limiting | Show rate limit message |
| Partial data | Store whatever is returned, log warnings |

---

## Summary

This feature adds a complete Visual DNA analysis workflow to the CRM:
- One-click analysis from the club detail view
- Deep integration with the existing GTM enrichment platform
- Comprehensive 10-section display matching the GTM Engine's capabilities
- Follows all existing patterns (hooks, edge functions, UI components)
- Proper button ordering that reflects the workflow sequence
