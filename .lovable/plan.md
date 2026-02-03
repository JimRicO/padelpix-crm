

# Plan: Create Person from Key People Card

## Overview
When a user clicks on a key person in the Club Enrichment section, a dialog will open pre-filled with the person's name, role, and context. On submit, the system will:
1. Create a new person record
2. Automatically link that person to the current club

## Implementation Steps

### Step 1: Create a new dialog component for creating a person from enrichment data

Create `src/components/club/CreatePersonFromKeyPeopleDialog.tsx`:
- Accept props: `open`, `onOpenChange`, `keyPerson` (name, role, context), `clubId`, `clubName`
- Pre-fill form fields:
  - `full_name` = keyPerson.name
  - `role` = keyPerson.role
  - `notes` = keyPerson.context (background info)
  - `country` = "South Africa" (default)
- On submit:
  1. Call `useCreatePerson` to create the person
  2. Call `useCreatePersonLink` to link the person to the club
  3. Show success toast with person name and club name
  4. Close dialog

### Step 2: Update ClubEnrichmentSections to handle clicks

Modify `src/components/club/ClubEnrichmentSections.tsx`:
- Add state for selected key person and dialog visibility
- Add `clubId` prop (needed for creating the link)
- Make key person cards clickable with hover state
- Add visual affordance (cursor-pointer, hover effect, maybe a small + icon)
- Render the new dialog component

### Step 3: Update parent components to pass clubId

Modify `src/components/club/ClubInfoTab.tsx`:
- Pass `club.id` to `ClubEnrichmentSections`

---

## Technical Details

### New Dialog Component Structure

```tsx
interface CreatePersonFromKeyPeopleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyPerson: { name: string; role: string; context?: string };
  clubId: string;
  clubName: string;
}
```

### Form Fields (pre-filled from enrichment data)
- Full Name (from keyPerson.name) - required
- Role (from keyPerson.role)
- Email (empty, user can add)
- LinkedIn (empty, user can add)
- Notes (from keyPerson.context - background info)

### Database Operations (in sequence)
1. Insert into `people` table
2. Insert into `person_links` table with:
   - `person_id` = new person's ID
   - `link_type` = 'club'
   - `club_id` = current club ID
   - `role_at_entity` = keyPerson.role
   - `is_primary` = true

### UI Changes to Key People Cards
- Add `cursor-pointer` class
- Add hover state: `hover:ring-2 hover:ring-primary/50`
- Add small "+" badge or overlay on hover to indicate action
- Add tooltip: "Click to create person record"

