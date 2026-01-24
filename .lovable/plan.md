

## Add "Create New Ownership Group" in Person Links Tab

### Overview
Allow users to create a new ownership group directly from the "Add Organization Link" dialog in the Person Links tab, rather than only selecting from existing groups.

---

### Current Behavior
When a user selects "Ownership Group" as the link type, they see a dropdown with only existing ownership groups. If the group they want doesn't exist, they have to leave the dialog, create the group elsewhere, and then come back.

### Proposed Behavior
When "Ownership Group" is selected:
1. Show the existing dropdown of ownership groups
2. Add a "+ Create New Group" option at the bottom of the dropdown
3. When clicked, show inline fields to enter the new group name
4. The new group is created and automatically selected when the user confirms the link

---

### UI Design

**Option: Inline "Create New" mode**

```
Link Type: [Ownership Group v]

Select Ownership Group:
[ Choose an ownership group  v]
  - Virgin Active
  - Africa Padel
  - Balwin
  ─────────────────────────────
  + Create New Group

[When "Create New Group" is selected:]

New Group Name:
[______________________]

Role at Organization:
[e.g., Owner, Manager    ]

[ ] This is the primary affiliation

        [Cancel]  [Add Link]
```

---

### Technical Implementation

**File to modify:** `src/components/people/PersonLinksTab.tsx`

**Changes:**
1. Add state for "create new" mode: `const [isCreatingNew, setIsCreatingNew] = useState(false)`
2. Add state for new group name: `const [newGroupName, setNewGroupName] = useState('')`
3. Import `useCreateOwnershipGroup` hook from `@/hooks/useOwnershipGroups`
4. Update the ownership group selection UI:
   - Add a special "create_new" option in the Select dropdown
   - When selected, switch to showing an Input field for the new group name
5. Update `handleAddLink` function:
   - If creating new, first call `createOwnershipGroup.mutateAsync({ name: newGroupName })`
   - Then create the person link with the new group name
6. Reset the create new state when dialog closes

**Code flow:**
```
User clicks "Create New Group" in dropdown
  -> setIsCreatingNew(true)
  -> Show Input field for new group name
  
User fills in name and clicks "Add Link"
  -> Create ownership group via useCreateOwnershipGroup
  -> Create person link with the new group name
  -> Close dialog and reset state
```

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/people/PersonLinksTab.tsx` | Add create new ownership group functionality inline in the Add Link dialog |

