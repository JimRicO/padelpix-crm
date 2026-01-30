

## Enhance Research Progress UI with Better Feedback

The current progress state shows a basic progress bar but lacks clear visual confirmation that the task is actively running. This plan will add more reassuring feedback elements.

---

### Current State (lines 489-506)

The progress UI currently shows:
- A pulsing search icon
- "Researching [name]..."
- A progress bar
- "Processing X of Y sources"

### Proposed Enhancements

| Element | Purpose |
|---------|---------|
| Green checkmark badge | Confirms connection to API is working |
| Job ID display | Technical confirmation the job was created |
| Status text with timestamp | Shows the current processing phase |
| "Last updated" indicator | Confirms polling is actively happening |
| Animated dots | Visual movement to show activity |

---

### Updated Progress Card Design

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│        🔍 (pulsing)                                  │
│                                                      │
│   Researching Chris Klein...                         │
│                                                      │
│   ✓ Job created successfully                         │
│   Job ID: API_PEOPLE_1769765...                      │
│                                                      │
│   [████████████░░░░░░░░░░░░░] 60%                    │
│                                                      │
│   ⏳ Status: processing                              │
│   Processing 3 of 5 sources...                       │
│                                                      │
│   🔄 Checking for updates every 10 seconds           │
│   Last checked: just now                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### Technical Implementation

**File to modify:** `src/components/people/PersonResearchTab.tsx`

1. **Add state for tracking last update time:**
   ```typescript
   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
   ```

2. **Update effect to track polling:**
   ```typescript
   useEffect(() => {
     if (status) {
       setLastUpdated(new Date());
     }
   }, [status]);
   ```

3. **Enhance progress card UI (lines 489-506):**
   - Add a green checkmark badge confirming job creation
   - Display truncated job ID for reference
   - Show current status phase (e.g., "processing", "pending")
   - Add "Last checked" timestamp with relative time
   - Add subtle animated indicator showing active polling

4. **Import additional icons:**
   - `CheckCircle` for success confirmation
   - `Clock` for last updated indicator

---

### Visual Feedback Elements

| Feedback | Implementation |
|----------|----------------|
| Job created confirmation | Green badge with checkmark icon |
| Active status | Badge showing current status with appropriate color |
| Progress details | Enhanced text with row counts |
| Polling indicator | Rotating refresh icon + "Last checked: X seconds ago" |
| Animated activity | Subtle animation on status elements |

---

### Code Changes Summary

**Lines 489-506** will be expanded to include:
- Success confirmation badge
- Job ID reference (truncated)
- Status badge with color coding
- Last updated timestamp
- Polling indicator animation

This provides users with multiple visual confirmations that the research is actively running and the system is responsive.

