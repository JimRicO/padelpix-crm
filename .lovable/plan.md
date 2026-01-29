
## Fix Organization Detail View - Display ALL Enriched Fields Correctly

### Problem Analysis
The current `OrganizationDetailView.tsx` is NOT matching the reference design and is missing/misrepresenting fields:

1. **Layout order is wrong** - Should follow the exact order from the reference image
2. **Typography labels are wrong** - Shows "Body:" instead of "Primary:" 
3. **Attitude & Aesthetics not showing** - These fields exist in the database but may not be rendering due to conditional logic or the user expects them in a different location
4. **Section structure doesn't match** - The reference shows a cleaner, more compact layout

### Database Fields Available (from Africa Padel record)
| Field | Value Present |
|-------|--------------|
| `logo_url` | Yes (SVG) |
| `name` | "Africa Padel" |
| `founding_year` | "2021" |
| `website` | Yes |
| `contact_phone` | "202023-07-18" |
| `color_palette` | 5 colors: link, accent, primary, background, textPrimary |
| `fonts` | heading + primary + list array |
| `description` | Full description text |
| `founder_info` | Full founder info |
| `attitude` | Full attitude text |
| `aesthetics` | Full aesthetics text |
| `perplexity_description` | Full research summary |
| `perplexity_citations` | Array of URLs |

### Solution: Restructure OrganizationDetailView to Match Reference

**File: `src/components/group/OrganizationDetailView.tsx`**

#### Changes Required:

1. **Fix section order to match reference image:**
   - Header (logo, name, Est. year, website)
   - Phone number card (standalone, not in grid)
   - Color Palette section
   - Typography section (fix labels: "Primary:" and "Heading:")
   - Description section
   - Founder section
   - Attitude & Aesthetics section (ensure these render)
   - Research Summary section
   - Recent Activities section
   - Sources/Citations section

2. **Fix Typography labels:**
   ```tsx
   // Current (wrong):
   {fonts.heading && <Badge>Heading: {fonts.heading}</Badge>}
   {fonts.primary && <Badge>Body: {fonts.primary}</Badge>}
   
   // Fixed:
   {fonts.primary && <Badge>Primary: {fonts.primary}</Badge>}
   {fonts.heading && <Badge>Heading: {fonts.heading}</Badge>}
   ```

3. **Fix Phone display styling:**
   - Move phone out of the contact grid into its own prominent card (matching reference)
   - Style it as a standalone `neu-pressed` card with phone icon

4. **Ensure Attitude & Aesthetics always render:**
   - Add dedicated sections for each (not combined into "Brand Identity")
   - Style as full-width text blocks in `detail-section-content` containers

5. **Complete Layout Structure:**

```text
+------------------------------------------------+
| [Logo]  Africa Padel   | Est. 2021 |           |
|         🌐 https://www.africapadel.com/        |
+------------------------------------------------+
| 📞 202023-07-18                                |
+------------------------------------------------+
| 🎨 Color Palette                               |
| [■ link] [■ accent] [■ primary] [■ bg] [■ txt] |
+------------------------------------------------+
| T Typography                                    |
| [Primary: Archivo...] [Heading: Archivo...]    |
+------------------------------------------------+
| 💬 Description                                  |
| Africa Padel is the largest padel club...      |
+------------------------------------------------+
| 👤 Founder                                      |
| Africa Padel was founded by James Baber...     |
+------------------------------------------------+
| ✨ Attitude                                     |
| Energetic, inclusive, and community-focused... |
+------------------------------------------------+
| 👁 Aesthetics                                   |
| Clean, modern design with a dark navy...       |
+------------------------------------------------+
| 🔬 Research Summary                             |
| [Perplexity description text...]               |
+------------------------------------------------+
| 📊 Recent Activities                            |
| [Activity cards...]                            |
+------------------------------------------------+
| 🔗 Sources (N)                                  |
| [Collapsible citations...]                     |
+------------------------------------------------+
```

### Technical Implementation

**1. Update OrganizationDetailView.tsx:**

- Reorder sections to match reference
- Split Attitude and Aesthetics into separate sections with full text (not badges)
- Fix Typography badge labels
- Move Phone to standalone card
- Ensure all fields render with appropriate fallbacks

**2. Add new section handlers for:**
- `attitude` - Full text in detail-section-content
- `aesthetics` - Full text in detail-section-content

### Files to Modify
- `src/components/group/OrganizationDetailView.tsx` - Complete restructure to match reference design

### Expected Outcome
After this fix:
- All enriched fields will display including Attitude and Aesthetics
- Layout will match the reference image exactly
- Typography labels will be correct ("Primary:" and "Heading:")
- Phone number will be prominent as shown in reference
- Color palette will show all 5+ colors with labels and hex values
