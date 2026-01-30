

## Add Person Research Feature with External API Integration

This feature will add a "Research" tab to the Person detail modal that allows users to enrich person profiles using the external People Intelligence API you provided.

---

### Overview

When a user clicks "Research" in the person modal:
1. They see a button to start research
2. The system calls the external API to create a research job
3. The UI polls for status updates while displaying progress
4. Once complete, results are displayed in a rich card format with all the data from the API

---

### Prerequisites

**Perplexity API Key**: The external API requires authentication. The Perplexity connector is available in your workspace but not linked to this project. I will connect it during implementation.

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/enrich-person/index.ts` | Create | Edge function to call the external People Intelligence API |
| `supabase/config.toml` | Modify | Add enrich-person function config |
| `src/components/people/PersonDetailModal.tsx` | Modify | Add 4th "Research" tab |
| `src/components/people/PersonResearchTab.tsx` | Create | New tab with research UI and result card |
| `src/hooks/usePersonEnrichment.ts` | Create | Hook for API calls and status polling |
| `src/types/people.ts` | Modify | Add EnrichedPerson interface |

---

### Implementation Details

#### 1. Edge Function: `enrich-person/index.ts`

Creates a research job via the external API:
- Receives `person_name` and optional `context` (derived from linked organizations)
- Calls `POST /api-create-people-job` with CRM_API_KEY authentication
- Returns `job_id` for status tracking

```typescript
// Key structure
const response = await fetch(
  'https://etscplmovnooalqfbzvy.supabase.co/functions/v1/api-create-people-job',
  {
    method: 'POST',
    headers: { 'x-api-key': CRM_API_KEY },
    body: JSON.stringify({ person_name, context })
  }
);
```

#### 2. Hooks: `usePersonEnrichment.ts`

Three main functions:
- **`useStartPersonResearch`**: Mutation to create research job
- **`usePersonResearchStatus`**: Query with polling for status updates (every 10s)
- **`usePersonResearchResults`**: Query to fetch completed results

State management:
- Stores `job_id` in component state (not persisted to DB for now)
- Polls until `is_complete: true`
- Fetches full results once complete

#### 3. Research Tab UI: `PersonResearchTab.tsx`

Three states:

**State 1 - No Research Yet**
```text
┌──────────────────────────────────────────┐
│  🔬 Research Profile                      │
│                                           │
│  Get AI-powered insights about this       │
│  person including career history,         │
│  contact info, and recent news.           │
│                                           │
│  Context: CEO at Acme Corp (optional)     │
│                                           │
│  [🔍 Start Research]                      │
└──────────────────────────────────────────┘
```

**State 2 - Research In Progress**
```text
┌──────────────────────────────────────────┐
│  ⏳ Researching John Smith...             │
│                                           │
│  [████████░░░░░░░░░░░░] 60%               │
│                                           │
│  Processing 3 of 5 sources                │
└──────────────────────────────────────────┘
```

**State 3 - Results Card** (based on your template)
```text
┌──────────────────────────────────────────┐
│  [Photo]  John Smith                      │
│           CEO at Acme Corporation         │
│           📍 San Francisco, CA            │
│           🏷️ high confidence              │
│                                           │
│  📊 Research Summary                      │
│  Comprehensive profile with 12 sources... │
│                                           │
│  👤 Biography                             │
│  John Smith is a seasoned technology...   │
│                                           │
│  📧 Contact                     🔗 Social │
│  john@acme.com (verified)     LinkedIn    │
│  +1-555-123-4567              @johnsmith  │
│                                           │
│  📰 Recent News                           │
│  • Acme Corp Raises $50M - TechCrunch     │
│  • Interview with CEO - Forbes            │
│                                           │
│  💡 Sales Insights                        │
│  Style: Direct and data-driven            │
│  Interests: AI/ML, Climate Tech           │
│  Starters: Recent acquisition strategy    │
│                                           │
│  💼 Career History                        │
│  • CEO at Acme (2022-present)             │
│  • VP Engineering at TechCo (2018-2022)   │
│                                           │
│  🎓 Education                             │
│  • MBA - Stanford GSB (2015)              │
│  • BS Computer Science - MIT (2010)       │
│                                           │
│  💬 Notable Quotes                        │
│  "Innovation requires calculated risk..." │
│                                           │
│  📚 Sources (12)                     [▼]  │
└──────────────────────────────────────────┘
```

#### 4. Modal Integration

Update `PersonDetailModal.tsx`:
- Change grid from 3 to 4 columns
- Add "Research" tab trigger and content
- Pass person data to new tab

```tsx
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="info">Info</TabsTrigger>
  <TabsTrigger value="links">Organizations</TabsTrigger>
  <TabsTrigger value="suggestions">...</TabsTrigger>
  <TabsTrigger value="research">Research</TabsTrigger>
</TabsList>
```

---

### Context Derivation

The research API accepts an optional `context` parameter. I'll derive this from:
1. Person's linked organizations (e.g., "CEO at Africa Padel Group")
2. Person's role field if no links exist
3. Empty string if nothing is available

This improves research accuracy by providing job title and company context.

---

### Data Schema Addition

Add to `src/types/people.ts`:

```typescript
export interface EnrichedPerson {
  id: string;
  person_name: string;
  job_title: string | null;
  company: string | null;
  department: string | null;
  location: string | null;
  photo_url: string | null;
  biography: string | null;
  biography_source: string | null;
  email: string | null;
  email_confidence: string | null;
  phone: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  website: string | null;
  previous_roles: Array<{ title: string; company: string; years?: string }>;
  education: Array<{ degree: string; institution: string; year?: string }>;
  recent_news: Array<{ headline: string; source: string; date: string; url: string }>;
  communication_style: string | null;
  key_interests: string[];
  conversation_starters: string[];
  quotes: string[];
  all_citations: string[];
  confidence_score: 'high' | 'medium' | 'low' | null;
  research_summary: string | null;
}
```

---

### Technical Flow

```text
User clicks "Start Research"
         │
         ▼
┌─────────────────────────────┐
│ Edge Function:              │
│ enrich-person               │
│   │                         │
│   └─► POST api-create-      │
│       people-job            │
│       Returns: job_id       │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend:                   │
│ Poll api-get-people-status  │
│ every 10 seconds            │
│   │                         │
│   └─► Show progress bar     │
└─────────────────────────────┘
         │
         ▼ (when is_complete)
┌─────────────────────────────┐
│ Frontend:                   │
│ Fetch api-get-people        │
│   │                         │
│   └─► Render result card    │
└─────────────────────────────┘
```

---

### Notes

- Results are stored in component state (not persisted to DB) for MVP
- Can add persistence later if needed
- The external API handles all AI research via Perplexity
- CRM_API_KEY is already configured and will be used

