# Component Layout Reference

**Status**: Living Document
**Last Updated**: 2025-10-03
**Purpose**: Visual reference for UI component names and positioning
**Related**: [UI Layout Hierarchy](./ui-layout-hierarchy.md), [Mobile UX Guidelines](../guidelines/mobile-ux-guidelines.md)

## Purpose

This document provides visual diagrams showing all main UI components and their names for easy reference
in conversations. Use these names when discussing layout changes: "Page Container", "Card Container",
"TodoItem", etc.

## Mobile Layout (< 640px)

<svg width="400" height="700" xmlns="http://www.w3.org/2000/svg">
  <!-- Screen boundary -->
  <rect x="10" y="10" width="380" height="680" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  <text x="200" y="30" text-anchor="middle" font-family="monospace" font-size="11" fill="#666">iPhone 14 (393px width)</text>

  <!-- Page Container (entire screen area) -->
  <rect x="20" y="50" width="360" height="620" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="30" y="70" font-family="monospace" font-size="12" font-weight="bold" fill="#ff6b6b">Page Container</text>
  <text x="30" y="85" font-family="monospace" font-size="10" fill="#666">px-0 (edge-to-edge)</text>

  <!-- Header -->
  <rect x="30" y="95" width="340" height="60" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
  <text x="200" y="120" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#1976d2">Header</text>
  <text x="200" y="140" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">Logo + Title + Subtitle</text>

  <!-- Card Container (main content area) -->
  <rect x="20" y="170" width="360" height="420" fill="none" stroke="#9c27b0" stroke-width="3"/>
  <text x="30" y="190" font-family="monospace" font-size="12" font-weight="bold" fill="#9c27b0">Card Container</text>
  <text x="30" y="205" font-family="monospace" font-size="10" fill="#666">p-0, border-x-0 (edge-to-edge)</text>

  <!-- TodoForm -->
  <rect x="30" y="215" width="340" height="50" fill="#fff3cd" stroke="#ffc107" stroke-width="2"/>
  <text x="200" y="235" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#f57f17">TodoForm</text>
  <text x="200" y="250" text-anchor="middle" font-family="monospace" font-size="9" fill="#666">Input + Button</text>

  <!-- TodoFilter -->
  <rect x="30" y="275" width="340" height="35" fill="#e8f5e9" stroke="#4caf50" stroke-width="2"/>
  <text x="200" y="295" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#2e7d32">TodoFilter</text>
  <text x="200" y="305" text-anchor="middle" font-family="monospace" font-size="9" fill="#666">Filter Buttons</text>

  <!-- TodoList Container -->
  <rect x="30" y="320" width="340" height="260" fill="none" stroke="#ff9800" stroke-width="2" stroke-dasharray="3,3"/>
  <text x="35" y="335" font-family="monospace" font-size="11" font-weight="bold" fill="#ff9800">TodoList</text>
  <text x="35" y="347" font-family="monospace" font-size="9" fill="#666">space-y-0 (no gaps)</text>

  <!-- TodoItem 1 -->
  <rect x="40" y="355" width="320" height="50" fill="#f3e5f5" stroke="#673ab7" stroke-width="2"/>
  <text x="200" y="375" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#512da8">TodoItem</text>
  <text x="200" y="390" text-anchor="middle" font-family="monospace" font-size="8" fill="#666">p-2, border-t, no sides</text>

  <!-- TodoItem 2 -->
  <rect x="40" y="405" width="320" height="50" fill="#f3e5f5" stroke="#673ab7" stroke-width="2"/>
  <text x="200" y="425" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#512da8">TodoItem</text>
  <text x="200" y="440" text-anchor="middle" font-family="monospace" font-size="8" fill="#666">[☐] Text [Actions]</text>

  <!-- TodoItem 3 -->
  <rect x="40" y="455" width="320" height="50" fill="#f3e5f5" stroke="#673ab7" stroke-width="2"/>
  <text x="200" y="475" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#512da8">TodoItem</text>

  <!-- TodoItem 4 -->
  <rect x="40" y="505" width="320" height="50" fill="#f3e5f5" stroke="#673ab7" stroke-width="2"/>
  <text x="200" y="525" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#512da8">TodoItem</text>

  <!-- Footer -->
  <rect x="30" y="600" width="340" height="40" fill="#fce4ec" stroke="#e91e63" stroke-width="2"/>
  <text x="200" y="622" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#c2185b">Footer</text>

  <!-- GestureHint (fixed at bottom of screen) -->
  <rect x="30" y="650" width="340" height="30" fill="#fff9c4" stroke="#f57f17" stroke-width="2"/>
  <text x="200" y="668" text-anchor="middle" font-family="monospace" font-size="10"
    font-weight="bold" fill="#f57f17">GestureHint (fixed bottom)</text>

  <!-- MarkdownHelpDrawer (overlay - shown when editing) -->
  <rect x="50" y="540" width="300" height="60" fill="rgba(255,255,255,0.95)"
    stroke="#00bcd4" stroke-width="3" rx="8"/>
  <text x="200" y="565" text-anchor="middle" font-family="monospace" font-size="11"
    font-weight="bold" fill="#00838f">MarkdownHelpDrawer (Overlay)</text>
  <text x="200" y="585" text-anchor="middle" font-family="monospace" font-size="9"
    fill="#666">Fixed bottom, 45vh height, when editing</text>
</svg>

## Desktop Layout (≥ 640px)

<svg width="500" height="700" xmlns="http://www.w3.org/2000/svg">
  <!-- Screen boundary -->
  <rect x="10" y="10" width="480" height="680" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  <text x="250" y="30" text-anchor="middle" font-family="monospace" font-size="11" fill="#666">Desktop (≥640px width)</text>

  <!-- Page Container (with padding) -->
  <rect x="20" y="50" width="460" height="620" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="30" y="70" font-family="monospace" font-size="12" font-weight="bold" fill="#ff6b6b">Page Container</text>
  <text x="30" y="85" font-family="monospace" font-size="10" fill="#666">px-6 (24px padding)</text>

  <!-- Header (with more padding) -->
  <rect x="50" y="95" width="400" height="70" fill="#e3f2fd" stroke="#2196f3" stroke-width="2"/>
  <text x="250" y="125" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#1976d2">Header</text>
  <text x="250" y="145" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">Logo + Title + Subtitle (larger)</text>

  <!-- Card Container (rounded, with padding) -->
  <rect x="50" y="180" width="400" height="420" fill="#ffffff" stroke="#9c27b0" stroke-width="3" rx="8"/>
  <text x="60" y="200" font-family="monospace" font-size="12" font-weight="bold" fill="#9c27b0">Card Container</text>
  <text x="60" y="215" font-family="monospace" font-size="10" fill="#666">p-5, border, rounded</text>

  <!-- TodoForm -->
  <rect x="70" y="225" width="360" height="55" fill="#fff3cd" stroke="#ffc107" stroke-width="2"/>
  <text x="250" y="248" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#f57f17">TodoForm</text>
  <text x="250" y="265" text-anchor="middle" font-family="monospace" font-size="9" fill="#666">Input + Button (side-by-side)</text>

  <!-- TodoFilter -->
  <rect x="70" y="290" width="360" height="35" fill="#e8f5e9" stroke="#4caf50" stroke-width="2"/>
  <text x="250" y="310" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#2e7d32">TodoFilter</text>
  <text x="250" y="320" text-anchor="middle" font-family="monospace" font-size="9" fill="#666">Filter Buttons</text>

  <!-- TodoList Container -->
  <rect x="70" y="335" width="360" height="255" fill="none" stroke="#ff9800" stroke-width="2" stroke-dasharray="3,3"/>
  <text x="75" y="350" font-family="monospace" font-size="11" font-weight="bold" fill="#ff9800">TodoList</text>
  <text x="75" y="362" font-family="monospace" font-size="9" fill="#666">space-y-3 (12px gaps)</text>

  <!-- TodoItem 1 (with drag handle) -->
  <rect x="80" y="370" width="340" height="55" fill="#f3e5f5" stroke="#673ab7" stroke-width="2" rx="8"/>
  <text x="250" y="393" text-anchor="middle" font-family="monospace" font-size="10"
    font-weight="bold" fill="#512da8">TodoItem</text>
  <text x="250" y="410" text-anchor="middle" font-family="monospace" font-size="8"
    fill="#666">p-4, rounded, Drag+Checkbox+Text+Reorder+Actions</text>

  <!-- Gap between items -->
  <text x="250" y="440" text-anchor="middle" font-family="monospace" font-size="9" fill="#ff9800">↕ 12px gap</text>

  <!-- TodoItem 2 -->
  <rect x="80" y="445" width="340" height="55" fill="#f3e5f5" stroke="#673ab7" stroke-width="2" rx="8"/>
  <text x="250" y="468" text-anchor="middle" font-family="monospace" font-size="10"
    font-weight="bold" fill="#512da8">TodoItem</text>
  <text x="250" y="485" text-anchor="middle" font-family="monospace" font-size="8"
    fill="#666">Drag + Checkbox + Content + Actions</text>

  <!-- Gap -->
  <text x="250" y="515" text-anchor="middle" font-family="monospace" font-size="9" fill="#ff9800">↕ 12px gap</text>

  <!-- TodoItem 3 -->
  <rect x="80" y="520" width="340" height="55" fill="#f3e5f5" stroke="#673ab7" stroke-width="2" rx="8"/>
  <text x="250" y="543" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#512da8">TodoItem</text>

  <!-- Footer -->
  <rect x="50" y="610" width="400" height="40" fill="#fce4ec" stroke="#e91e63" stroke-width="2"/>
  <text x="250" y="632" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#c2185b">Footer</text>

  <!-- MarkdownHelpBox (inline - shown when editing a TodoItem) -->
  <rect x="90" y="455" width="330" height="45" fill="#e0f7fa" stroke="#00bcd4" stroke-width="2" rx="4"/>
  <text x="255" y="473" text-anchor="middle" font-family="monospace" font-size="10"
    font-weight="bold" fill="#00838f">MarkdownHelpBox (Inline)</text>
  <text x="255" y="490" text-anchor="middle" font-family="monospace" font-size="8"
    fill="#666">Collapsible, expands within TodoItem when editing</text>
</svg>

## Component Reference

### Structural Components

| Component          | Description                                                       | File Location     |
| ------------------ | ----------------------------------------------------------------- | ----------------- |
| **Page Container** | Outermost wrapper for entire screen                               | `app/page.tsx:41` |
| **Header**         | Logo, title, and subtitle                                         | `app/page.tsx:42` |
| **Card Container** | Main content area (white card on desktop, edge-to-edge on mobile) | `app/page.tsx:61` |
| **Footer**         | Bottom credits                                                    | `app/page.tsx:92` |

### Interactive Components

| Component      | Description                                    | File Location                   |
| -------------- | ---------------------------------------------- | ------------------------------- |
| **TodoForm**   | Input field and "Add" button for new todos     | `app/components/TodoForm.tsx`   |
| **TodoFilter** | Filter buttons (All, Active, Completed, etc.)  | `app/components/TodoFilter.tsx` |
| **TodoList**   | Container for all todo items                   | `app/components/TodoList.tsx`   |
| **TodoItem**   | Individual todo item with checkbox and actions | `app/components/TodoItem.tsx`   |

### Overlay/Helper Components

| Component              | Description                                 | File Location                           | Platform              |
| ---------------------- | ------------------------------------------- | --------------------------------------- | --------------------- |
| **GestureHint**        | Fixed banner showing swipe/long-press hints | `app/components/GestureHint.tsx`        | Mobile only           |
| **MarkdownHelpDrawer** | Bottom overlay for markdown reference       | `app/components/MarkdownHelpDrawer.tsx` | Mobile (during edit)  |
| **MarkdownHelpBox**    | Inline collapsible markdown reference       | `app/components/MarkdownHelpBox.tsx`    | Desktop (during edit) |

## Key Layout Differences

### Mobile (< 640px)

- **Edge-to-edge layout**: No horizontal padding on Page Container (`px-0`) or Card Container (`p-0`)
- **Borders separate items**: TodoList uses `space-y-0` with `border-t` on items
- **Compact spacing**: TodoItem uses `p-2` (8px)
- **Fixed bottom elements**: GestureHint always visible at bottom
- **Overlay help**: MarkdownHelpDrawer slides up from bottom (45% viewport height)

### Desktop (≥ 640px)

- **Contained layout**: Page Container has `px-6` (24px), Card Container has `p-5` (20px)
- **Gaps between items**: TodoList uses `space-y-3` (12px)
- **Spacious padding**: TodoItem uses `p-4` (16px)
- **Rounded corners**: Card and TodoItems have `rounded-lg`
- **Inline help**: MarkdownHelpBox expands within TodoItem
- **More features visible**: Drag handles, reorder buttons

## Component Hierarchy

```text
Page Container (outermost wrapper)
├── Header (logo, title, subtitle)
├── Card Container (main content card)
│   ├── TodoForm (input + Add button)
│   ├── TodoFilter (filter buttons)
│   └── TodoList (todo items container)
│       └── TodoItem (individual todo)
│           ├── Checkbox
│           ├── Content
│           ├── Actions (Edit, Delete, etc.)
│           └── MarkdownHelpBox (desktop, when editing)
└── Footer (credits)

Additional (overlays/fixed position):
├── GestureHint (mobile only, fixed bottom)
└── MarkdownHelpDrawer (mobile only, portal overlay when editing)
```

## Usage in Conversations

When discussing layout changes, use these component names for clarity:

**Examples:**

- ✅ "Reduce padding in the **TodoItem** component"
- ✅ "The **Card Container** should be edge-to-edge on mobile"
- ✅ "Add spacing between the **TodoFilter** and **TodoList**"
- ✅ "The **MarkdownHelpDrawer** overlaps the **Footer**"
- ✅ "**Page Container** padding needs adjustment"

**Avoid vague terms:**

- ❌ "The main container" (which one?)
- ❌ "The list area" (TodoList or TodoItem?)
- ❌ "The top section" (Header or Card Container?)

## Related Documentation

- [UI Layout Hierarchy](./ui-layout-hierarchy.md) - Detailed spacing breakdown and pixel values
- [Spacing Breakdown](./spacing-breakdown/README.md) - Visual spacing diagrams with measurements
- [Mobile UX Guidelines](../guidelines/mobile-ux-guidelines.md) - Mobile-first spacing strategy
- [Accessibility Requirements](../guidelines/accessibility-requirements.md) - Touch target requirements

---

**Use this diagram as a reference when discussing layout changes to ensure clear communication about
which component needs adjustment.**
