

## Stack Action Buttons into Visual DNA Card

This plan consolidates the 3-step action workflow buttons (Enrich, Analyze Visual DNA, Push to PadelPix) from the footer into a dedicated action section within the Visual DNA card for better visual grouping.

---

### Current Layout

The ClubInfoTab has:
- A Visual DNA card (collapsible) showing analysis results
- A footer action bar at the bottom containing: Delete, Enrich, Analyze Visual DNA, Push to PadelPix, and Save buttons

### Proposed Layout

Move the 3 workflow buttons into a new "Action Buttons Card" positioned near the Visual DNA card:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ACTION WORKFLOW                                                    │
│  ┌──────────────┐  ┌──────────────────────┐  ┌────────────────────┐ │
│  │ 1. Enrich    │  │ 2. Analyze DNA       │  │ 3. Push to PadelPix│ │
│  │   [Done]     │  │   [Analyze]          │  │   [Push]           │ │
│  └──────────────┘  └──────────────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ▸ Visual DNA                                   [Score Badge]        │
│   (collapsible analysis results as before)                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Technical Details

**File: `src/components/club/ClubInfoTab.tsx`**

1. **Create a new neumorphic card** positioned above or integrated with the VisualDnaCard area (around line 672)

2. **Move the workflow buttons** from the footer (lines 727-900) into this new card:
   - Step 1: Enrich button with "Done" badge or "Re-enrich" state
   - Step 2: Analyze Visual DNA button with timestamp or "Analyzing..." state
   - Step 3: Push to PadelPix button with "Pushed" timestamp or "Re-sync" option

3. **Keep in the footer**:
   - Delete Club button (left side)
   - Save Changes button (right side)

4. **Styling**:
   - Use `neu-card` container with `p-4` padding
   - Horizontal flex layout with `gap-3` between buttons
   - Add a small header: "Action Workflow" with step indicators

5. **Move the Alert Dialogs** (Push Confirm, Missing DNA Warning) to be rendered within the new card section

---

### Visual Design

The new card will use the neumorphic design system:
- Container: `rounded-xl bg-background` with `neu-subtle` shadow
- Clear step numbering (1, 2, 3) for sequential workflow
- Buttons maintain their current color coding:
  - Enrich: Blue/Primary
  - Analyze DNA: Cyan
  - Push: Orange/Primary

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/club/ClubInfoTab.tsx` | Move workflow buttons into a card above VisualDnaCard; simplify footer to Delete + Save only |

