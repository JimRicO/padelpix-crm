
# Unified Card Design System

## Problem Analysis

Currently, the codebase has **5 different card implementations** with inconsistent styling:

| Card | Styling Approach | Padding | Gaps | Icon Sizes | Title Size |
|------|------------------|---------|------|------------|------------|
| ClubCard | Custom `.club-card` CSS class | p-4 | gap-2, gap-3 | w-3, w-3.5 | text-sm |
| OrganizationCard | Uses `<Card>` + `CardContent` | p-4 | gap-3, gap-4 | w-4, w-3 | default (text-base) |
| PersonCard | Uses `<Card>` + `CardContent` | p-4 | gap-3, gap-2 | w-3.5 | default (text-base) |
| EnterpriseGroupCard | Custom inline Tailwind | p-3 | gap-2, gap-3 | w-3, w-4 | text-sm |
| ClubCardCompact | Custom `.club-card-row` class | px-3 py-2 | gap-2.5 | w-3, w-4 | text-sm |

## Solution: Unified Design Tokens

### 1. Define Standard Card Sizes

Create three standardized card variants:

```text
COMPACT (row-style cards)
+------------------------------------------+
| [icon] Title            [status] [icon] |
+------------------------------------------+
Padding: px-2.5 py-1.5 | Gap: 2 | Icons: w-3.5

STANDARD (default cards - ClubCard, EnterpriseGroupCard)
+------------------------------------------+
| [icon] Title                    [status] |
| Metadata line 1                          |
| Metadata line 2                          |
| [Badge]                      [secondary] |
+------------------------------------------+
Padding: p-3 | Gap: 1.5 | Icons: w-3 | Title: text-sm

FEATURED (detail cards - PersonCard, OrganizationCard)
+------------------------------------------+
| [Avatar/Logo]  Title           [Badge]   |
|                Subtitle                  |
| ---------------------------------------- |
| Icon  Detail 1                           |
| Icon  Detail 2                           |
| Icon  Detail 3                           |
+------------------------------------------+
Padding: p-3 | Avatar: w-10 h-10 | Gap: 2 | Icons: w-3.5 | Title: text-sm font-semibold
```

### 2. Standardized CSS Classes (src/index.css)

Create unified utility classes:

```css
/* Card Base - shared neumorphic shadow */
.card-base {
  @apply rounded-2xl bg-background cursor-pointer transition-all duration-200;
  box-shadow: 5px 5px 10px hsl(var(--shadow-dark) / 0.5),
              -2px -2px 5px hsl(var(--shadow-light) / 0.2);
}
.card-base:hover {
  transform: translateY(-1px);
  box-shadow: 6px 6px 12px hsl(var(--shadow-dark) / 0.55),
              -2px -2px 6px hsl(var(--shadow-light) / 0.25);
}

/* Card Compact - row style */
.card-compact {
  @apply card-base px-2.5 py-1.5 flex items-center gap-2;
}

/* Card Standard - pipeline cards */
.card-standard {
  @apply card-base p-3;
}

/* Card Featured - detail cards with avatar/logo */
.card-featured {
  @apply card-base p-3;
}

/* Standardized internal spacing */
.card-header { @apply flex items-start justify-between gap-2 mb-1.5; }
.card-title { @apply font-semibold text-sm text-foreground truncate; }
.card-subtitle { @apply text-xs text-muted-foreground; }
.card-meta { @apply flex items-center gap-1 text-xs text-muted-foreground; }
.card-meta-row { @apply flex items-center gap-3 text-xs text-muted-foreground mb-1.5; }
.card-footer { @apply flex items-center justify-between mt-1.5; }
.card-divider { @apply mt-1.5 pt-1.5 border-t border-border; }

/* Standardized icon sizes */
.card-icon-sm { @apply w-3 h-3 flex-shrink-0; }
.card-icon { @apply w-3.5 h-3.5 flex-shrink-0; }
.card-avatar { @apply w-10 h-10 rounded-lg flex-shrink-0; }
```

### 3. Files to Update

#### A. src/index.css
- Add new unified card utility classes
- Update existing `.club-card` and `.club-card-row` to use new tokens
- Reduce `.tier-badge` and `.stage-badge` padding for compactness

#### B. src/components/ui/card.tsx
- Update `CardHeader` padding: `p-6` → `p-3`, `space-y-1.5` → `space-y-1`
- Update `CardContent` padding: `p-6` → `p-3`
- Update `CardFooter` padding: `p-6` → `p-3`
- Update `CardTitle` size: `text-2xl` → `text-sm`

#### C. src/components/pipeline/ClubCard.tsx
- Keep using `.club-card` class (will be updated in CSS)
- Standardize internal spacing: `mb-2` → `mb-1.5`, `gap-3` → `gap-2`
- Use consistent icon size: `w-3 h-3` for all icons

#### D. src/components/organizations/OrganizationCard.tsx
- Apply `card-featured` approach via updated Card component
- Reduce avatar/logo: `w-12 h-12` → `w-10 h-10`
- Standardize gaps: `gap-3` → `gap-2`, `gap-4` → `gap-3`
- Standardize margins: `mb-2` → `mb-1.5`, `mb-1` → `mb-1`
- Use consistent icon sizes: secondary icons `w-3.5 h-3.5`, inline icons `w-3 h-3`

#### E. src/components/people/PersonCard.tsx
- Apply `card-featured` approach via updated Card component
- Reduce avatar: `w-12 h-12` → `w-10 h-10`
- Standardize gaps: `gap-3` → `gap-2`
- Standardize section spacing: `mt-3 pt-3` → `mt-2 pt-2`
- Reduce line spacing: `space-y-1.5` → `space-y-1`
- Use consistent icon size: `w-3.5 h-3.5`

#### F. src/components/pipeline/EnterpriseGroupCard.tsx
- Compact mode: use `.card-compact` class pattern
- Expanded mode: use `.card-standard` class pattern
- Standardize icon sizes: all `w-3.5 h-3.5` → `w-3 h-3` for consistency with ClubCard

#### G. src/components/pipeline/ClubCardCompact.tsx
- Update to use new `.card-compact` styling tokens
- Reduce padding: `px-3 py-2` → `px-2.5 py-1.5`

---

## Summary of Unified Tokens

| Token | Value | Usage |
|-------|-------|-------|
| **Padding (compact)** | px-2.5 py-1.5 | Row-style cards |
| **Padding (standard/featured)** | p-3 | All detail cards |
| **Gap (internal)** | gap-2 | Between elements |
| **Gap (metadata row)** | gap-3 | Between meta items |
| **Margin (sections)** | mb-1.5 | Between card sections |
| **Divider spacing** | mt-1.5 pt-1.5 | Border-separated sections |
| **Icon (inline)** | w-3 h-3 | Icons in metadata |
| **Icon (standalone)** | w-3.5 h-3.5 | Icons with emphasis |
| **Avatar/Logo** | w-10 h-10 | Featured cards |
| **Title** | text-sm font-semibold | All cards |
| **Subtitle** | text-xs text-muted-foreground | Secondary text |
| **Border radius** | rounded-2xl | All cards |

This creates a cohesive, compact design system that maintains the neumorphic style while ensuring visual consistency across all card types.
