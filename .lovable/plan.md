

# Update View Toggle Button Labels

## Overview
Simple text update to make the view toggle buttons more concise and consistent.

## Changes

### File: src/components/pipeline/PipelineBoard.tsx

Update the button labels in the view toggle section:

| Current Label | New Label |
|---------------|-----------|
| Group View | GROUP |
| Individual | CLUB |

### Code Change

**Before:**
```tsx
<Button ...>
  <Users className="w-3.5 h-3.5" />
  Group View
</Button>
<Button ...>
  <LayoutGrid className="w-3.5 h-3.5" />
  Individual
</Button>
```

**After:**
```tsx
<Button ...>
  <Users className="w-3.5 h-3.5" />
  GROUP
</Button>
<Button ...>
  <LayoutGrid className="w-3.5 h-3.5" />
  CLUB
</Button>
```

## Result
The toggle buttons will display "GROUP" and "CLUB" as uppercase labels, making them more compact and visually consistent.

