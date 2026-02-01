

## Plan: Add Markdown Support for Notes

### Overview
Add automatic markdown rendering for all notes fields across the application. Users will be able to write notes using markdown syntax (bold, italic, lists, links, etc.) and see them properly formatted when displayed.

### What You'll Get
- **Rich text display**: Notes will render with proper formatting for headers, bold, italic, lists, links, code blocks, etc.
- **Consistent experience**: All notes across Clubs, People, and Organizations will support markdown
- **Easy editing**: The text input remains plain text - just write markdown naturally

### Example
When you type:
```
**Important:** Follow up next week

- Call about partnership
- Send pricing sheet

Check their [website](https://example.com)
```

It will display with proper formatting: bold text, bullet points, and clickable links.

---

### Technical Details

#### 1. Install Markdown Library
Add `react-markdown` package to parse and render markdown content safely.

#### 2. Enable Typography Plugin
Update `tailwind.config.ts` to include the typography plugin (already installed as a dev dependency). This provides the `prose` CSS classes for beautiful text styling.

```text
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
```

#### 3. Create Reusable Markdown Component
Create a new `MarkdownRenderer` component at `src/components/ui/markdown-renderer.tsx` that:
- Uses `react-markdown` to parse markdown
- Applies Tailwind typography classes
- Handles dark mode styling
- Opens links in new tabs safely

#### 4. Update Display Components
Replace plain text rendering with the new `MarkdownRenderer` in these locations:

| File | Field | Change |
|------|-------|--------|
| `ClubInfoTab.tsx` | notes | Add read-only markdown preview below Textarea |
| `PersonInfoTab.tsx` | notes | Add read-only markdown preview below Textarea |
| `OwnershipGroupModal.tsx` | notes | Add read-only markdown preview below Textarea |
| `ClubTasksTab.tsx` | task.description | Replace plain `<p>` with MarkdownRenderer |
| `OrganizationDetailView.tsx` | description, founder_info, attitude, aesthetics, perplexity_description | Replace plain `<p>` with MarkdownRenderer |

#### 5. UX Pattern for Editable Notes
For editable notes fields, implement a preview section that shows how the markdown will render:
- Keep the `Textarea` for editing (users type markdown syntax)
- Add a "Preview" section below that renders the markdown
- Use a subtle visual distinction (muted background) for the preview area

