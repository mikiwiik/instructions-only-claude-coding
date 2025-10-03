# UI Layout and Spacing Reference

**Status**: Living Document
**Last Updated**: 2025-10-04
**Purpose**: Complete visual and technical reference for UI components, layout, and spacing
**Related**: [Mobile UX Guidelines](../guidelines/mobile-ux-guidelines.md), [Accessibility Requirements](../guidelines/accessibility-requirements.md)

---

## Table of Contents

1. [Quick Visual Reference](#quick-visual-reference) - Component diagrams
2. [Component Reference](#component-reference) - Tables with file locations
3. [Spacing Mechanics](#spacing-mechanics) - How padding/margins create gaps
4. [Common Scenarios](#common-scenarios) - "What creates what"
5. [Usage in Conversations](#usage-in-conversations) - Examples

---

## Quick Visual Reference

### Mobile Layout (< 640px)

![Mobile Layout Diagram](diagrams/mobile-layout.svg)

### Desktop Layout (≥ 640px)

![Desktop Layout Diagram](diagrams/desktop-layout.svg)

---

## Component Reference

### Structural Components

| Component          | Description                                                       | File Location  |
| ------------------ | ----------------------------------------------------------------- | -------------- |
| **Page Container** | Outermost wrapper for entire screen                               | `app/page.tsx` |
| **Header**         | Logo, title, and subtitle                                         | `app/page.tsx` |
| **Card Container** | Main content area (white card on desktop, edge-to-edge on mobile) | `app/page.tsx` |
| **Footer**         | Bottom credits                                                    | `app/page.tsx` |

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

### Component Hierarchy

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

---

## Spacing Mechanics

### Key Concept: Layers of Spacing

The application uses **nested spacing layers** that combine to create the final visual layout:

```text
Screen Edge
  ↓ Page Padding (px-0 mobile / px-6 desktop - edge-to-edge on mobile)
Container Boundary
  ↓ Card Padding (p-0 mobile / p-5 desktop - edge-to-edge on mobile)
Component Boundary
  ↓ Item Padding (p-2 mobile / p-4 desktop)
Content
```

### Mobile Layout (< 640px)

#### Full Page Breakdown

```text
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN EDGE (0px)                                               │
│ ════════════════════════════════════════════════════════════════│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 0px (px-0) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Page
│ ▒┌──────────────────────────────────────────────────────────┐▒│ Padding
│ ▒│ HEADER                                                   │▒│ EDGE-TO-EDGE
│ ▒│ [CheckSquare Icon] Todo App                             │▒│
│ ▒│ A Next.js Todo application...                           │▒│
│ ▒└──────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                     24px (mb-6)                            ▒│ Header
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────┐▒│
│ ▒│ CARD BORDER ┌────────────────────────────────────────┐   │▒│
│ ▒│             │ ░░░░░ 0px (p-0) ░░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Card
│ ▒│             │ ░┌────────────────────────────────────┐░│   │▒│ Padding
│ ▒│             │ ░│ TodoForm                           │░│   │▒│ EDGE-TO-EDGE
│ ▒│             │ ░│ ┌────────────────────────────────┐ │░│   │▒│
│ ▒│             │ ░│ │ 12px (px-3) → Textarea ← 12px  │ │░│   │▒│ Form
│ ▒│             │ ░│ └────────────────────────────────┘ │░│   │▒│ Textarea
│ ▒│             │ ░│            [Add Todo Button]       │░│   │▒│ Padding
│ ▒│             │ ░└────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             │              16px (mb-4)               │   │▒│ Form
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Margin
│ ▒│             │ ░┌────────────────────────────────────┐░│   │▒│
│ ▒│             │ ░│ TodoFilter                         │░│   │▒│
│ ▒│             │ ░│ [All] [Active] [Completed] [...]   │░│   │▒│
│ ▒│             │ ░└────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             │              16px (mb-4)               │   │▒│ Filter
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Margin
│ ▒│             │ ░┌────────────────────────────────────┐░│   │▒│
│ ▒│             │ ░│ TodoList                           │░│   │▒│
│ ▒│             │ ░│ ┌──────────────────────────────┐   │░│   │▒│
│ ▒│             │ ░│ │▓▓ 8px (p-2) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│
│ ▒│             │ ░│ │▓[☐] Buy milk          [Edit]▓│   │░│   │▒│ TodoItem
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 8px▓│   │░│   │▒│ Padding
│ ▒│             │ ░│ ├──────────────────────────────┤   │░│   │▒│ ← BORDER-TOP
│ ▒│             │ ░│ │          0px (space-y-0)     │   │░│   │▒│ ← (borders
│ ▒│             │ ░│ ├──────────────────────────────┤   │░│   │▒│ ← separate
│ ▒│             │ ░│ │▓▓ 8px (p-2) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│ ← items)
│ ▒│             │ ░│ │▓[☐] Walk dog          [Edit]▓│   │░│   │▒│
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 8px▓│   │░│   │▒│
│ ▒│             │ ░│ └──────────────────────────────┘   │░│   │▒│
│ ▒│             │ ░└────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             └────────────────────────────────────────┘   │▒│
│ ▒└──────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                     24px (mt-6)                            ▒│ Footer
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────┐▒│
│ ▒│ FOOTER                                                   │▒│
│ ▒│ Built with ❤️ using Claude Code                          │▒│
│ ▒└──────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ════════════════════════════════════════════════════════════════│
└─────────────────────────────────────────────────────────────────┘

Legend:
▒▒▒ = Page padding (px-0 = 0px horizontal - EDGE-TO-EDGE LAYOUT)
░░░ = Card padding (p-0 = 0px all sides - EDGE-TO-EDGE LAYOUT)
▓▓▓ = TodoItem padding (p-2 = 8px all sides)
```

#### Spacing Measurements

| Visual Gap             | Created By    | Tailwind    | Pixels | Component      |
| ---------------------- | ------------- | ----------- | ------ | -------------- |
| Screen edge → Header   | Page padding  | `px-0`      | 0px    | Page Container |
| Header → Card          | Header margin | `mb-6`      | 24px   | Header         |
| Card border → Form     | Card padding  | `p-0`       | 0px    | Card Container |
| Form → Filter          | Form margin   | `mb-4`      | 16px   | TodoForm       |
| Filter → List          | Filter margin | `mb-4`      | 16px   | TodoFilter     |
| Todo item → Todo item  | List gap      | `space-y-0` | 0px    | TodoList       |
| Item border → Checkbox | Item padding  | `p-2`       | 8px    | TodoItem       |
| Checkbox → Text        | Internal gap  | `gap-2`     | 8px    | TodoItem       |
| Text → Edit button     | Internal gap  | `gap-2`     | 8px    | TodoItem       |
| Card → Footer          | Card margin   | `mt-6`      | 24px   | Card Container |

### Desktop Layout (≥ 640px)

#### Full Page Breakdown

```text
┌─────────────────────────────────────────────────────────────────────┐
│ SCREEN EDGE (0px)                                                   │
│ ════════════════════════════════════════════════════════════════════│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 24px (px-6) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Page
│ ▒┌──────────────────────────────────────────────────────────────┐▒│ Padding
│ ▒│ HEADER (larger text, more spacing)                          │▒│ (contained)
│ ▒│ [CheckSquare Icon] Todo App                                 │▒│
│ ▒│ A Next.js Todo application built with TDD                   │▒│
│ ▒└──────────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                       32px (mb-8)                              ▒│ Header
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────────┐▒│
│ ▒│ CARD BORDER ┌────────────────────────────────────────────┐   │▒│
│ ▒│  (rounded)  │ ░░░░░░░░ 20px (p-5) ░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Card
│ ▒│             │ ░┌────────────────────────────────────────┐░│   │▒│ Padding
│ ▒│             │ ░│ TodoForm                               │░│   │▒│ (contained)
│ ▒│             │ ░│ ┌──────────────────────────────────┐   │░│   │▒│
│ ▒│             │ ░│ │ 16px (px-4) → Textarea ← 16px    │   │░│   │▒│ Form
│ ▒│             │ ░│ └──────────────────────────────────┘   │░│   │▒│ Textarea
│ ▒│             │ ░│          [Add Todo Button]             │░│   │▒│ Padding
│ ▒│             │ ░└────────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             │              24px (mb-6)                   │   │▒│ Form
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Margin
│ ▒│             │ ░┌────────────────────────────────────────┐░│   │▒│
│ ▒│             │ ░│ TodoFilter                             │░│   │▒│
│ ▒│             │ ░│ [All (5)] [Active (3)] [Completed (2)] │░│   │▒│
│ ▒│             │ ░└────────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             │              16px (mb-4)                   │   │▒│ Filter
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│ Margin
│ ▒│             │ ░┌────────────────────────────────────────┐░│   │▒│
│ ▒│             │ ░│ TodoList                               │░│   │▒│
│ ▒│             │ ░│ ┌──────────────────────────────────┐   │░│   │▒│
│ ▒│             │ ░│ │▓▓▓ 16px (p-4) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│
│ ▒│             │ ░│ │▓[☰][☐] Buy milk [↑][↓][Edit][×]▓│   │░│   │▒│ TodoItem
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 16px▓│   │░│   │▒│ Padding
│ ▒│             │ ░│ └──────────────────────────────────┘   │░│   │▒│ (rounded)
│ ▒│             │ ░│          12px (space-y-3)              │░│   │▒│ ← GAP
│ ▒│             │ ░│ ┌──────────────────────────────────┐   │░│   │▒│ ← between
│ ▒│             │ ░│ │▓▓▓ 16px (p-4) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│ ← items
│ ▒│             │ ░│ │▓[☰][☐] Walk dog [↑][↓][Edit][×]▓│   │░│   │▒│
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 16px▓│   │░│   │▒│
│ ▒│             │ ░│ └──────────────────────────────────┘   │░│   │▒│
│ ▒│             │ ░└────────────────────────────────────────┘░│   │▒│
│ ▒│             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │▒│
│ ▒│             └────────────────────────────────────────────┘   │▒│
│ ▒└──────────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                       32px (mt-8)                              ▒│ Footer
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────────┐▒│
│ ▒│ FOOTER                                                       │▒│
│ ▒│ Built with ❤️ using Claude Code                              │▒│
│ ▒└──────────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ════════════════════════════════════════════════════════════════════│
└─────────────────────────────────────────────────────────────────────┘

Legend:
▒▒▒ = Page padding (px-6 = 24px horizontal)
░░░ = Card padding (p-5 = 20px all sides)
▓▓▓ = TodoItem padding (p-4 = 16px all sides)
```

#### Spacing Measurements

| Visual Gap                | Created By    | Tailwind    | Pixels | Component      |
| ------------------------- | ------------- | ----------- | ------ | -------------- |
| Screen edge → Header      | Page padding  | `px-6`      | 24px   | Page Container |
| Header → Card             | Header margin | `mb-8`      | 32px   | Header         |
| Card border → Form        | Card padding  | `p-5`       | 20px   | Card Container |
| Form → Filter             | Form margin   | `mb-6`      | 24px   | TodoForm       |
| Filter → List             | Filter margin | `mb-4`      | 16px   | TodoFilter     |
| Todo item → Todo item     | List gap      | `space-y-3` | 12px   | TodoList       |
| Item border → Drag handle | Item padding  | `p-4`       | 16px   | TodoItem       |
| Drag → Checkbox           | Internal gap  | `gap-3`     | 12px   | TodoItem       |
| Checkbox → Text           | Internal gap  | `gap-3`     | 12px   | TodoItem       |
| Text → Actions            | Internal gap  | `gap-3`     | 12px   | TodoItem       |
| Card → Footer             | Card margin   | `mt-8`      | 32px   | Card Container |

### Key Layout Differences

#### Mobile (< 640px)

- **Edge-to-edge layout**: No horizontal padding on Page Container (`px-0`) or Card Container (`p-0`)
- **Borders separate items**: TodoList uses `space-y-0` with `border-t` on items
- **Compact spacing**: TodoItem uses `p-2` (8px)
- **Fixed bottom elements**: GestureHint always visible at bottom
- **Overlay help**: MarkdownHelpDrawer slides up from bottom (45% viewport height)

#### Desktop (≥ 640px)

- **Contained layout**: Page Container has `px-6` (24px), Card Container has `p-5` (20px)
- **Gaps between items**: TodoList uses `space-y-3` (12px)
- **Spacious padding**: TodoItem uses `p-4` (16px)
- **Rounded corners**: Card and TodoItems have `rounded-lg`
- **Inline help**: MarkdownHelpBox expands within TodoItem
- **More features visible**: Drag handles, reorder buttons

---

## Common Scenarios

### "Vertical whitespace in the list"

**What it IS**:

- The gap between TodoItem components
- Controlled by: **TodoList** component → `space-y-0 sm:space-y-3`
- Mobile: 0px (borders separate items), Desktop: 12px

**What it is NOT**:

- Padding inside TodoItem (that's `p-2/p-4`)
- Margin around TodoList container (that's TodoFilter's `mb-4`)
- Space between item content and buttons (that's `gap-2/gap-3`)
- Border-top on items (that's the visual separator on mobile)

### "Horizontal spacing in items"

**What it IS**:

- Padding inside TodoItem creating space from border to content
- Controlled by: **TodoItem** component → `p-2 sm:p-4`
- Mobile: 8px, Desktop: 16px

**What it is NOT**:

- Gap between checkbox and text (that's `gap-2/gap-3`)
- Page padding (that's `px-0/px-6` - edge-to-edge on mobile)
- Card padding (that's `p-0/p-5/p-6` - edge-to-edge on mobile)

### "Distance from screen edge"

**What it IS**:

- **Layer 1**: Page padding (`px-0 sm:px-6`) = 0px/24px
- **Layer 2**: Card padding (`p-0 sm:p-5`) = 0px/20px
- **Total**: 0px (mobile - edge-to-edge) / 44px (desktop) from edge to content

**What it is NOT**:

- Just page padding alone
- Just card padding alone
- The gap between items
- Mobile uses edge-to-edge layout (0px from screen edge)

---

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

**When discussing spacing changes:**

- ✅ "The vertical whitespace is the purple gap - that's `space-y-0 sm:space-y-3` in the **TodoList** component"
- ✅ "The horizontal padding is the orange layer - that's `p-2 sm:p-4` in the **TodoItem** component"
- ✅ "Edge-to-edge means `px-0` and `p-0` on mobile - 0px from screen edge"

---

## Related Documentation

- [Mobile UX Guidelines](../guidelines/mobile-ux-guidelines.md) - Mobile-first spacing strategy
- [Accessibility Requirements](../guidelines/accessibility-requirements.md) - Touch target requirements (44×44px minimum)
- [UI Layout Hierarchy](./ui-layout-hierarchy.md) - Complete component hierarchy and measurements

---

**Use this document as a complete reference for both quick visual lookup and deep technical understanding of spacing mechanics.**
