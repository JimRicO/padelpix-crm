
## Plan: Add Monthly Calendar View to Agenda

### Overview
Transform the Agenda page from a simple list view to a full monthly calendar view that defaults to February 2026. Users will be able to see events displayed on specific days, navigate between months, and quickly see their schedule at a glance.

### What You'll Get
- **Monthly Calendar Grid**: A visual calendar showing the current month with events displayed on their dates
- **View Toggle**: Ability to switch between "Calendar" and "List" views using tabs
- **Month Navigation**: Previous/Next buttons to move between months
- **Event Indicators**: Small dots or badges on calendar days that have events
- **Day Click**: Clicking a day shows the events for that day in a side panel or popover
- **Today Highlight**: Current day visually distinguished
- **February 2026 Default**: Calendar opens to February 2026 as requested

---

### Implementation Steps

#### Phase 1: Create Calendar View Component

**New file: `src/components/agenda/CalendarView.tsx`**

This component renders a monthly calendar grid:

| Feature | Details |
|---------|---------|
| Month header | Shows "February 2026" with navigation arrows |
| Day grid | 7 columns (Sun-Sat), 5-6 rows for weeks |
| Day cells | Show date number + event count badge |
| Today styling | Highlighted background/border |
| Event dots | Small indicators for days with events |
| Click handler | Opens day's events in a popover/panel |

Uses existing `date-fns` functions:
- `startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`
- `eachDayOfInterval`, `isSameMonth`, `isSameDay`, `format`
- `addMonths`, `subMonths` for navigation

#### Phase 2: Create Day Events Popover

**New file: `src/components/agenda/DayEventsPopover.tsx`**

When clicking a day in the calendar:
- Shows a popover with events for that day
- Lists events with time, title, and linked club
- Includes "Add Event" button pre-filled with selected date
- Uses existing `EventCard` styling

#### Phase 3: Update Agenda Page with View Toggle

**Modify: `src/pages/Agenda.tsx`**

Add view switching:
- Add `viewMode` state: `'calendar' | 'list'`
- Add `currentMonth` state initialized to `new Date(2026, 1, 1)` (February 2026)
- Add Tabs component in the main area
- Render `CalendarView` or existing list based on selection

Layout structure:
```text
+----------------------------------+
| PageHeader (search, Add Event)   |
+----------------------------------+
| [Calendar] [List]   <- Feb 2026 ->|
+----------------------------------+
|  Sun Mon Tue Wed Thu Fri Sat     |
|  --------------------------------|
|  ...     1   2   3   4   5   6   |
|          *       *               | <- dots for events
|  7   8   9  10  11  12  13       |
|  ...                             |
+----------------------------------+
```

#### Phase 4: Styling Details

**Calendar Grid Styling:**
- Uses CSS Grid: 7 columns
- Day cells: `aspect-square` for consistent sizing
- Muted colors for days outside current month
- Primary background for "today"
- Hover state for interactive days

**Event Indicators:**
- Small colored dots (max 3 visible, then "+X more")
- System events: gray dot
- Manual events: primary color dot

---

### Technical Approach

**Calendar Date Calculation:**
```text
1. Get first day of current month
2. Get start of week containing that day
3. Get last day of current month
4. Get end of week containing that day
5. Generate array of all days in range
6. Render in 7-column grid
```

**Event Grouping by Day:**
```text
1. Filter events by current month
2. Group by date key (yyyy-MM-dd)
3. For each day cell, look up events by date key
4. Show count/dots accordingly
```

**Responsive Design:**
- On mobile: smaller day cells
- Day numbers remain visible, event count as single number
- Popover adapts to available space

---

### Files Summary

**Create:**
- `src/components/agenda/CalendarView.tsx` - Monthly calendar grid
- `src/components/agenda/DayEventsPopover.tsx` - Events display for selected day

**Modify:**
- `src/pages/Agenda.tsx` - Add view toggle and calendar state
