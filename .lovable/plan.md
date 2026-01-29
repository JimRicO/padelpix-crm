

## Fix Color Palette Display

### Problem
The color palette display in `EnrichmentSections.tsx` is missing colors:
1. The `background` color from the palette is not displayed
2. The type definition assumes exactly 4 fixed color keys, but the API may return additional colors

### Solution
Update the color palette display to show all colors returned by the enrichment API, including `background` and any additional colors.

### Changes

**File: `src/components/group/EnrichmentSections.tsx`**

Update the color palette rendering section (lines 86-121) to:
1. Add display for the `background` color
2. Dynamically render all colors in the palette object (in case the API returns additional colors beyond the 4 expected)
3. Use a more flexible rendering approach that iterates over all palette keys

**Updated Color Palette Section:**
```tsx
{colorPalette && Object.keys(colorPalette).length > 0 && (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">Colors</p>
    <div className="flex gap-2 flex-wrap">
      {Object.entries(colorPalette).map(([name, color]) => 
        color && (
          <div key={name} className="flex items-center gap-1">
            <div 
              className="w-6 h-6 rounded border" 
              style={{ backgroundColor: color as string }}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
            />
            <span className="text-xs capitalize">{name}</span>
          </div>
        )
      )}
    </div>
  </div>
)}
```

### Benefits
- Shows all 4 colors including `background`
- Future-proof: automatically displays any additional colors the API might return
- Cleaner code with less repetition

