## Issue
`AddClubDialog` submits `tier: formData.tier as ClubTier` even when the user leaves the Tier dropdown as "Select tier" (empty string `""`). Postgres rejects this with `invalid input value for enum club_tier: ""`.

## Fix
In `src/components/club/AddClubDialog.tsx`, change the submit payload to only include `tier` when it has a value:

```ts
tier: formData.tier ? (formData.tier as ClubTier) : undefined,
```

Single-file, ~1 line change. No DB or backend work needed.