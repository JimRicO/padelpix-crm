
# Plan: Add Missing Club Fields to Database and Cards

## Overview
Add 14 new fields to the clubs table and update all relevant UI components to display and manage this data.

## Database Changes

A database migration will add the following columns to the `clubs` table:

| Field | Type | Description |
|-------|------|-------------|
| phone | text | Direct phone number (separate from WhatsApp) |
| business_description | text | Description of the club |
| google_maps_url | text | Link to Google Maps location |
| facebook | text | Facebook page URL |
| twitter | text | Twitter/X handle or URL |
| insta_url | text | Direct Instagram URL |
| insta_bio | text | Instagram bio text |
| insta_followers | integer | Instagram follower count |
| avg_likes | integer | Average likes on posts |
| avg_comments | integer | Average comments on posts |
| avg_video_views | integer | Average video views |
| top_hashtags | text[] | Array of top hashtags used |
| key_individuals | text[] | Array of key people at the club |

## Files to Update

### 1. TypeScript Types
**File:** `src/types/database.ts`
- Add all 14 new fields to the `Club` interface

### 2. Club Info Tab (Detail Modal)
**File:** `src/components/club/ClubInfoTab.tsx`
- Add form fields for all new data
- Group Instagram metrics in a dedicated section
- Add social media section for Facebook/Twitter

### 3. Club Cards
**File:** `src/components/pipeline/ClubCard.tsx`
- Display Instagram followers with an icon when available
- Show key social metrics in a compact format

### 4. Add Club Dialog
**File:** `src/components/club/AddClubDialog.tsx`
- Add optional fields for the new data during club creation

### 5. Import Dialog
**File:** `src/components/import/ImportDialog.tsx`
- Update field mappings for CSV/JSON import
- Support new column names in imports

### 6. Hooks
**File:** `src/hooks/useClubs.ts`
- Update create/update mutations to handle new fields

## UI Organization

The Club Info Tab will be reorganized into sections:

```
+---------------------------+
| Basic Info                |
| - Name, Contact, Logo     |
+---------------------------+
| Social Media              |
| - Instagram, Facebook,    |
|   Twitter, LinkedIn       |
+---------------------------+
| Instagram Metrics         |
| - Bio, Followers, Likes,  |
|   Comments, Views, Tags   |
+---------------------------+
| Location & Contact        |
| - Address, Maps, Phone,   |
|   WhatsApp, Email         |
+---------------------------+
| Business                  |
| - Description, Website    |
+---------------------------+
| Key People                |
| - Contact Name, Coaches,  |
|   Key Individuals         |
+---------------------------+
```

## Technical Notes

- All new fields are nullable (optional)
- Arrays (`top_hashtags`, `key_individuals`) will use Postgres text[] type
- Instagram metrics fields use your specified naming: `insta_bio`, `insta_followers`
- Import will support column aliases (e.g., "Instagram Bio" maps to `insta_bio`)
