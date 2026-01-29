

## Display All Enrichment Fields on OrganizationCard

### Problem
The OrganizationCard component is NOT displaying all the enrichment data that has been saved to the database. Critical fields like `founder_info`, `description`, `perplexity_description`, `address`, and `contact_phone` are completely ignored on the card view.

### Current State
The database has rich data for enriched organizations including:
- `founder_info`: "Africa Padel was founded by James Baber, who serves as CEO..."
- `perplexity_description`: Full research summary
- `description`: AI-generated description
- `address`: Physical location
- `contact_phone`: Phone number
- `color_palette`: Full color set with 6+ colors

But the card only shows a subset of fields (name, logo, status, founding year, Instagram, attitude/aesthetics).

### Solution
Update `OrganizationCard.tsx` to display ALL enrichment fields in a comprehensive but readable layout.

### Changes to OrganizationCard.tsx

**Add these fields to the card:**

1. **Description** - Show a truncated version (2-3 lines max) of `group.description`
2. **Founder Info** - Display `group.founder_info` with a label
3. **Address** - Show `group.address` with MapPin icon
4. **Phone** - Display `group.contact_phone` alongside email
5. **Color Palette** - Show color swatches from `group.color_palette`
6. **Instagram Bio** - Display truncated `group.instagram_bio`
7. **Perplexity Description** - Show truncated research summary

**Card Layout (updated):**

```text
+----------------------------------------+
| [Logo] Name           [Status] [Enrich]|
|        3 of 15 clubs • South Africa    |
|        Est. 2021                        |
|----------------------------------------|
| 📍 123 Main St, Cape Town              |
| 📧 email@org.com  📞 +27 123 456       |
| 🌐 website.com                          |
|----------------------------------------|
| 📸 @instagram • 15.2K followers         |
| "Instagram bio text here..."            |
|----------------------------------------|
| Description text here (truncated)...   |
|----------------------------------------|
| 👤 Founder: James Baber, CEO...         |
|----------------------------------------|
| Colors: [■][■][■][■][■]                 |
| Tags: [Energetic] [Modern Design]       |
+----------------------------------------+
|                           [✓ Enriched] |
+----------------------------------------+
```

### Files to Modify

1. **`src/components/organizations/OrganizationCard.tsx`**
   - Add display for `description` (truncated to ~100 chars)
   - Add display for `founder_info` (truncated)
   - Add display for `address` with MapPin icon
   - Add display for `contact_phone` with Phone icon
   - Add color palette swatches (dynamic rendering like EnrichmentSections)
   - Add display for `instagram_bio` (truncated)
   - Organize into clear visual sections

### Implementation Details

- Use `line-clamp-2` or `line-clamp-3` CSS classes for truncation
- Add Phone icon from lucide-react for phone display
- Dynamically render all colors from `color_palette` object
- Maintain compact design while showing all data
- Keep existing functionality (click handler, enrich button)

### Expected Outcome
After this change, the OrganizationCard will show ALL enrichment data including:
- Founder information (the missing field you mentioned)
- Full color palette
- Description
- Address
- Phone
- Instagram bio
- All other enriched fields

