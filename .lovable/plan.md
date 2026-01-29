

# Plan: Improve CSV Import Preview Experience

## Problem Summary
The current import preview is confusing because:
- The preview table only shows 6 of 18+ possible columns
- Users can't see if their new fields (followers, likes, hashtags, etc.) were parsed
- The "Supported columns" help text is outdated
- There's no clear feedback when a file is loaded or which columns were recognized

## Solution Overview
Redesign the import preview to give clear feedback at every step.

---

## Changes

### 1. Update Help Text (Supported Columns)
**File:** `src/components/import/ImportDialog.tsx`

Replace the outdated "Supported columns" text with a complete list organized by category:
- Basic: name, instagram, city, country, address, website, email
- Contact: phone, whatsapp, contact name
- Social: facebook, twitter, linkedin
- Instagram: insta_url, insta_bio, insta_followers, avg_likes, avg_comments, avg_video_views, top_hashtags
- Other: courts, key_individuals, business_description, google_maps_url

### 2. Show File Upload Feedback
**File:** `src/components/import/ImportDialog.tsx`

After a file is uploaded:
- Display a success message with the filename
- Show a quick summary: "Found X rows and Y columns"
- Replace the placeholder text in the textarea with actual data

### 3. Add Column Recognition Summary
**File:** `src/components/import/ImportDialog.tsx`

Before the preview table, show which columns from the CSV were recognized:
- Green checkmarks for matched columns (e.g., "name → club_name")
- Yellow warnings for unrecognized columns that will be skipped
- This helps users understand if their data will import correctly

### 4. Expand Preview Table Columns
**File:** `src/components/import/ImportDialog.tsx`

Make the preview table scrollable horizontally and show more fields:
- Always show: Name, Instagram, City, Status
- Conditionally show columns that have data: Followers, Likes, Phone, etc.
- Add a small badge showing "X more fields" that users can hover to see full list

### 5. Add Data Quality Indicators
**File:** `src/components/import/ImportDialog.tsx`

For each row in preview, show:
- How many fields were populated (e.g., "12/18 fields")
- Highlight any issues (missing required field, invalid data format)

---

## UI Flow After Changes

```text
+-------------------------------------------+
| Upload .csv file   [Choose File]          |
+-------------------------------------------+
| File loaded: clubs_export.csv             |
| Found 45 rows, 12 columns                 |
+-------------------------------------------+
| Recognized columns:                       |
| ✓ name → club_name                        |
| ✓ instagram → instagram_handle            |
| ✓ followers → insta_followers             |
| ✓ avg_likes → avg_likes                   |
| ⚠ "random_col" - not recognized, skipped  |
+-------------------------------------------+
|        [Preview Import]                   |
+-------------------------------------------+

After clicking Preview Import:

+-------------------------------------------+
| ✓ 43 new clubs  ⚠ 2 duplicates (skipped)  |
+-------------------------------------------+
| Name | Instagram | City | Followers | ... |
|------|-----------|------|-----------|-----|
| Club | @handle   | NYC  | 1.2k      | ... |
+-------------------------------------------+
| Each row shows: "8/18 fields filled"      |
+-------------------------------------------+
|    [Back]            [Import 43 Clubs]    |
+-------------------------------------------+
```

---

## Technical Details

### Column Detection Logic
Add a function to compare CSV headers against the field mapping dictionary and return:
- `matchedColumns`: array of { csvHeader, mappedField }
- `unmatchedColumns`: array of unrecognized header names

### Dynamic Table Columns
Instead of hardcoding 6 columns, dynamically generate table headers based on which fields have at least one non-empty value in the parsed data.

### Files Modified
- `src/components/import/ImportDialog.tsx` - all UI changes

