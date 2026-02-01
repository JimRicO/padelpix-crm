

## Plan: Create Agenda Feature

### Overview
Add a calendar-based agenda view to the CRM that displays scheduled events, both manually created and automatically generated when clubs move through the pipeline. The Agenda will become the first navigation item, providing quick visibility into upcoming activities.

### What You'll Get
- **Agenda Page** (`/agenda`): A dedicated view showing events grouped by date (Today, Tomorrow, then by specific day)
- **Add Event Modal**: Create manual events with optional club linking
- **Automatic Pipeline Events**: When a club's stage changes, an event is auto-created
- **Visual Distinction**: System-generated events styled in gray, manual events in normal styling

---

### Implementation Steps

#### Phase 1: Database Setup

**Create `agenda_events` table:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| event_date | date | Required |
| event_time | time | Optional |
| title | text | Required |
| description | text | Optional |
| event_type | text | 'manual' or 'system' |
| club_id | uuid | Optional, foreign key to clubs |
| created_by | uuid | User reference |
| created_at | timestamp | Default now() |

**Row Level Security:**
- Users can only view/create/update/delete their own events
- System events also check that the linked club belongs to the user

---

#### Phase 2: Frontend Implementation

**Files to create:**

1. **`src/pages/Agenda.tsx`**
   - Page layout with PageHeader (consistent with Clubs/People/Organizations)
   - "Add Event" button in header actions
   - Events grouped by date sections:
     - "Today" (expanded)
     - "Tomorrow" (expanded)
     - Future dates grouped by day (expanded)
     - Past dates (collapsed by default)
   - Empty state when no events

2. **`src/hooks/useAgendaEvents.ts`**
   - `useAgendaEvents()` - Fetch all events with optional club data
   - `useCreateAgendaEvent()` - Create new manual event
   - `useUpdateAgendaEvent()` - Edit existing event
   - `useDeleteAgendaEvent()` - Remove event

3. **`src/components/agenda/AddEventDialog.tsx`**
   - Modal with form fields:
     - Date picker (required) - using existing Calendar + Popover pattern
     - Time picker (optional) - simple time input
     - Title (required)
     - Description (optional) - Textarea with markdown preview
     - Club selector (optional) - Dropdown of user's clubs

4. **`src/components/agenda/EventCard.tsx`**
   - Display individual event with time, title, description
   - Show linked club name with click-through option
   - Styled differently for system vs manual events

5. **`src/components/agenda/EventDateGroup.tsx`**
   - Collapsible section for each date
   - Shows date header with event count
   - Contains list of EventCard components

**Files to modify:**

1. **`src/App.tsx`**
   - Add route: `/agenda` -> `Agenda` page

2. **`src/components/layout/PageHeader.tsx`**
   - Add "Agenda" as first navigation item

---

#### Phase 3: Database Trigger for Pipeline Changes

**Create trigger function `log_pipeline_stage_change()`:**
```text
When clubs.pipeline_stage is updated:
  - Insert into agenda_events
  - event_date = current_date
  - event_type = 'system'
  - title = "[Club Name] moved to [New Stage Name]"
  - club_id = the club's id
  - created_by = the club's created_by (owner)
```

**Create trigger on clubs table:**
- Fires AFTER UPDATE
- Only when pipeline_stage column actually changes

---

### Technical Approach

**Date Grouping Logic:**
```text
1. Group events by event_date
2. Label groups:
   - If date === today: "Today"
   - If date === tomorrow: "Tomorrow"
   - Else: format as "Wednesday, 5 February 2025"
3. Sort: Past dates at bottom (collapsed), Today first, then future dates
```

**Stage Name Formatting:**
The trigger will convert pipeline stage values like `dm_sent` to readable format "DM Sent" for the event title.

**Club Selector:**
Uses existing `useClubs()` hook to populate dropdown, reusing the Select component pattern from AddClubDialog.

---

### UI/UX Details

**Event Card Styling:**
- System events: `bg-muted/50 text-muted-foreground border-dashed`
- Manual events: Standard card styling with neumorphic shadow
- Time displayed in badge format when set
- Club name shown as clickable link

**Collapsible Sections:**
- Uses existing Collapsible component
- ChevronDown/ChevronRight icons for expand/collapse state
- Past dates collapsed by default with "Past Events" label

