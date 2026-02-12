

# Fix: Mobile Dialog Centering for All Card Modals

## Problem
When a user taps on a People card, Club card, or Organization card on mobile, the modal appears off-center (bottom-right corner) instead of centered on screen.

## Root Cause
The base `DialogContent` sets `w-[calc(100%-2rem)]` and `max-w-lg`, but individual modals override these with larger max-widths (`max-w-2xl`, `max-w-3xl`, `max-w-4xl`) and add `p-0` / `overflow-hidden`. On mobile, the dialog can exceed viewport bounds, breaking the `translate-x/y(-50%)` centering.

## Solution
Add proper mobile-safe viewport constraints to the base `DialogContent` so every modal stays centered and scrollable regardless of its content or overrides.

## Files to Change

### 1. `src/components/ui/dialog.tsx`
Update the base `DialogContent` className to add:
- `max-h-[90vh]` — prevent dialog from exceeding viewport height
- `overflow-y-auto` — allow scrolling when content is tall

This ensures the `fixed inset-50% + translate(-50%)` centering always works because the dialog never grows beyond the viewport.

### 2. `src/components/people/PersonDetailModal.tsx`
No changes needed — already uses `max-w-2xl max-h-[90vh] overflow-y-auto`, which will work with the base fix.

### 3. `src/components/club/ClubDetailModal.tsx`
Currently: `max-w-3xl max-h-[90vh] overflow-hidden flex flex-col`
No changes needed — the base fix handles mobile sizing.

### 4. `src/components/group/OwnershipGroupModal.tsx`
Currently: `max-w-4xl max-h-[90vh] p-0 overflow-hidden`
No changes needed — the base fix handles mobile sizing.

## Technical Detail
The core fix is on `dialog.tsx` line 39, changing:
```
"fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-background p-6 duration-200"
```
to:
```
"fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-background p-6 duration-200"
```

This is minimal and non-breaking — modals that already set their own `max-h` and `overflow` will simply override the base values via Tailwind's class merge (`cn()`).
