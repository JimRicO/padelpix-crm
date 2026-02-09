

## Fix: Tasks not appearing on the Agenda

### Problem
Tasks created for clubs (like U-Padel Woodlands) have `due_date` stored as a full timestamp (`2026-02-12 00:00:00+00`), but the Agenda calendar and list views use simple date strings (`2026-02-12`) as lookup keys. The mismatch means task events are never found when rendering the calendar grid or grouping by date.

### Solution
Normalize the `event_date` when converting tasks to agenda format, so the date string matches the `yyyy-MM-dd` format used everywhere else.

### Technical Details

**File: `src/pages/Agenda.tsx`**

In the `convertedTasks` memo (around line 80), change:
```typescript
event_date: task.due_date!,
```
to:
```typescript
event_date: format(parseISO(task.due_date!), 'yyyy-MM-dd'),
```

This uses `parseISO` and `format` (both already imported) to normalize the timestamp into the expected `yyyy-MM-dd` format, matching the key format used in `CalendarView` and the list grouping logic.

This is a one-line fix that resolves the mismatch for both the calendar view and the list view.

