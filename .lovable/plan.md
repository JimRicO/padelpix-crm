

# Smart AI-Powered Data Normalizer with Anthropic Claude Haiku

## Overview
Build a unified import tool that uses **Claude Haiku** (via Anthropic's API directly) to automatically detect data types (clubs, organizations, or people) and intelligently transform any input data into the correct CRM schema.

---

## Prerequisites

You'll need to add your Anthropic API key first. I'll prompt you to add the `ANTHROPIC_API_KEY` secret before implementing the feature.

---

## How It Works

```text
+------------------+     +----------------------+     +------------------+     +------------------+
|   Paste/Upload   | --> |   Claude Haiku API   | --> |  Preview & Edit  | --> |  Import to DB    |
|  (JSON/CSV/Text) |     | (Anthropic Direct)   |     |  (Review Results)|     |  (Bulk Create)   |
+------------------+     +----------------------+     +------------------+     +------------------+
```

1. **Paste or upload** any data (JSON, CSV, or raw text)
2. **Claude Haiku analyzes** the data and determines:
   - Entity type (club, organization, or person)
   - Field mappings to your CRM schema
3. **Preview** the transformed data with detected entity type
4. **Import** directly to the appropriate database table

---

## Implementation Plan

### Phase 1: Add Anthropic API Key Secret
- Prompt you to add `ANTHROPIC_API_KEY` to the project secrets

### Phase 2: Create Edge Function for Normalization

**File: `supabase/functions/normalize-data/index.ts`**

The edge function will:
- Accept raw input data (JSON, CSV, or text)
- Call Anthropic's Claude Haiku API directly using the model `claude-haiku-4-5-20251001`
- Return normalized data with entity type and field mappings

```text
API Call:
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: ANTHROPIC_API_KEY
  - anthropic-version: 2023-06-01
  - Content-Type: application/json
```

### Phase 3: Create Frontend Components

**File: `src/components/import/SmartImportDialog.tsx`**

A 3-step wizard:
1. **Input Step**: Paste data or upload file, detect format (JSON/CSV/Text)
2. **Processing Step**: Send to Claude Haiku, show loading state
3. **Preview Step**: Show detected entity type, field mappings, and transformed records

**File: `src/hooks/useSmartImport.ts`**

Custom hook for:
- Calling the normalize-data edge function
- Managing import state
- Handling bulk create for each entity type

### Phase 4: Add Bulk Create for People

**Modify: `src/hooks/usePeople.ts`**

Add `useBulkCreatePeople` mutation (similar to existing bulk create hooks for clubs and organizations)

### Phase 5: Integration

**Modify: `src/components/layout/PageHeader.tsx`**

Add a "Smart Import" button accessible from all pages

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `supabase/functions/normalize-data/index.ts` | Create | Claude Haiku normalization edge function |
| `supabase/config.toml` | Modify | Register new edge function |
| `src/components/import/SmartImportDialog.tsx` | Create | Main smart import UI component |
| `src/hooks/useSmartImport.ts` | Create | Import logic and state management |
| `src/hooks/usePeople.ts` | Modify | Add useBulkCreatePeople hook |
| `src/components/layout/PageHeader.tsx` | Modify | Add Smart Import button |

---

## Edge Function Details

### Anthropic API Call Structure

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Transform the following input data...`
    }]
  })
});
```

### Schema Definitions for AI

| Entity Type | Key Fields |
|---|---|
| **Club** | club_name, instagram_handle, city, country, address, phone, email, website, google_maps_url, number_of_courts |
| **Organization** | name, organization_type, country, website, contact_name, contact_email, contact_phone, address |
| **Person** | full_name, role, email, phone, country, instagram_handle, linkedin, notes |

### Entity Detection Logic

The AI prompt will guide Claude to detect entity type based on:

| Signals for Club | Signals for Organization | Signals for Person |
|---|---|---|
| "courts", "venue", "location" | "federation", "association" | "name" with role/title |
| Address with facility details | "member clubs", "governing body" | Email with person format |
| Instagram handle patterns | Business structure hints | LinkedIn profile |
| Google Maps/Business Profile | Organization type hints | Contact method fields |

---

## Response Format from Edge Function

```json
{
  "success": true,
  "entity_type": "club",
  "confidence": "high",
  "records": [
    {
      "club_name": "Padel Haus Williamsburg",
      "website": "http://padel.haus/",
      "google_maps_url": "https://maps.google.com/...",
      "address": "307 Kent Ave, Brooklyn, NY 11249, USA",
      "phone": "(917) 970-0036",
      "country": "United States"
    }
  ],
  "field_mappings": {
    "Name": "club_name",
    "Website": "website",
    "Google Business Profile": "google_maps_url",
    "Address": "address",
    "Phone Number": "phone"
  },
  "unmapped_fields": ["Rating", "Reviews Count", "organization.name"],
  "warnings": ["Country auto-detected from address"]
}
```

---

## UI Design

### Step 1: Input

```text
+----------------------------------------------------------+
|  Smart Import (AI-Powered)                          [X]  |
+----------------------------------------------------------+
|                                                          |
|  Paste or Upload Data                                    |
|  ┌────────────────────────────────────────────────────┐  |
|  │                                                    │  |
|  │  Paste JSON, CSV, or any structured data here...  │  |
|  │                                                    │  |
|  └────────────────────────────────────────────────────┘  |
|                                                          |
|  [Upload File]  Supports: JSON, CSV, TXT                 |
|                                                          |
|                              [Analyze with AI]           |
+----------------------------------------------------------+
```

### Step 2: Preview

```text
+----------------------------------------------------------+
|  Smart Import (AI-Powered)                          [X]  |
+----------------------------------------------------------+
|                                                          |
|  Detected: CLUBS (5 records)               [Override]    |
|  Confidence: High                                        |
|                                                          |
|  Field Mappings:                                         |
|  ┌────────────────────────────────────────────────────┐  |
|  │  Name → club_name                              OK  │  |
|  │  Website → website                             OK  │  |
|  │  Phone Number → phone                          OK  │  |
|  │  Rating → (not mapped)                         --  │  |
|  └────────────────────────────────────────────────────┘  |
|                                                          |
|  Preview (first 5):                                      |
|  ┌────────────────────────────────────────────────────┐  |
|  │  Padel Haus Williamsburg                           │  |
|  │  Reserve Padel NYC                                 │  |
|  │  Mink Padel                                        │  |
|  └────────────────────────────────────────────────────┘  |
|                                                          |
|  [Back]                            [Import 5 Clubs]      |
+----------------------------------------------------------+
```

---

## Error Handling

- **Rate limits**: Show friendly retry message
- **API errors**: Display error with raw response for debugging
- **Invalid response from Claude**: Fall back to manual import dialog
- **Empty results**: Show guidance on data format

