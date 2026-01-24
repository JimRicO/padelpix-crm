

## Pipeline Card Redesign: Full Card vs. Checkbox Row

### Concept

Create two distinct card layouts based on pipeline position:

1. **First Column ("Not Contacted")** - Full detail card with all current information
2. **Subsequent Columns** - Minimal checkbox row showing just name + checkmark to indicate progression

This creates a visual flow where clubs start with full details, then become compact checkmarks as they progress through the pipeline.

---

### Visual Design

**First Column (Not Contacted) - Full Card:**
```text
┌─────────────────────────────┐
│ 👑 Virgin Active Sandton  ● │  ← Name + priority dot
│ @virginactive_sa            │  ← Instagram
│ 📍 Johannesburg  🏢 8 courts │  ← Location + courts
│ 👥 Virgin Active            │  ← Ownership group
│ [GROUP OWNED]         💬 3  │  ← Tier + DM count
├─────────────────────────────┤
│ → Schedule demo call        │  ← Next action
└─────────────────────────────┘
```

**Subsequent Columns - Checkbox Row:**
```text
┌─────────────────────────────┐
│ ☑ Virgin Active Sandton    │
└─────────────────────────────┘
```

The checkbox indicates "this stage is complete" - showing the club has progressed through the pipeline.

---

### Technical Implementation

| File | Change |
|------|--------|
| `src/components/pipeline/ClubCard.tsx` | Add `isFirstColumn` prop, conditionally render full or compact layout |
| `src/components/pipeline/ClubCardCompact.tsx` | New component for the checkbox row variant |
| `src/components/pipeline/PipelineBoard.tsx` | Pass stage info to ClubCard to determine which layout to use |
| `src/index.css` | Add `.club-card-row` class for compact checkbox layout |

---

### Component Structure

**New ClubCardCompact.tsx:**
```tsx
interface ClubCardCompactProps {
  club: Club;
  onClick: () => void;
  isDragging?: boolean;
}

export function ClubCardCompact({ club, onClick, isDragging }: ClubCardCompactProps) {
  return (
    <div onClick={onClick} className="club-card-row">
      <Checkbox checked disabled className="pointer-events-none" />
      <span className="font-medium text-sm truncate">{club.club_name}</span>
      {club.tier === 'group_owned' && <Crown className="w-3 h-3 text-primary" />}
    </div>
  );
}
```

**Updated PipelineBoard.tsx rendering logic:**
```tsx
{stage === 'not_contacted' ? (
  <ClubCard club={club} onClick={() => onClubClick(club)} isDragging={snapshot.isDragging} />
) : (
  <ClubCardCompact club={club} onClick={() => onClubClick(club)} isDragging={snapshot.isDragging} />
)}
```

---

### CSS Styling

```css
.club-card-row {
  @apply flex items-center gap-2 rounded-md bg-card px-3 py-2 
         border border-border hover:bg-accent/50 
         transition-colors cursor-pointer;
}
```

---

### Behavior Details

- **Checkbox is visual only** - shows the club has "passed" this stage (always checked)
- **Clicking the row** opens the full club detail modal (same as current behavior)
- **Drag and drop** still works on compact rows
- **Priority indicator** can optionally show as a subtle left border color on compact rows
- **Crown icon** still appears for group-owned clubs in compact view

---

### Summary

| Column | Layout | Height | Info Shown |
|--------|--------|--------|------------|
| Not Contacted | Full card | ~120px | All details |
| All others | Checkbox row | ~36px | Checkbox + name + crown icon |

This approach:
- Reduces visual clutter by 70%+ on most columns
- Makes the "Not Contacted" column the focus for prospecting
- Creates a clear visual progression as clubs move right
- Maintains full details on click via the modal

