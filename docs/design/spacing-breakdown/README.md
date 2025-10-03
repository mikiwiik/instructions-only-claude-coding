# Visual Spacing Breakdown

**Status**: Living Document
**Last Updated**: 2025-10-03
**Related**:
[UI Layout Hierarchy](../ui-layout-hierarchy.md),
[Mobile UX Guidelines](../../guidelines/mobile-ux-guidelines.md)

## Purpose

This directory contains annotated visual references showing how padding, margins, and gaps create
the visual spacing in the Todo application. These diagrams help identify "which spacing creates
which visual gap" for clearer communication during layout discussions.

## Overview

### Key Concept: Layers of Spacing

The application uses **nested spacing layers** that combine to create the final visual layout:

```text
Screen Edge
  ↓ Page Padding (px-4/px-6)
Container Boundary
  ↓ Card Padding (p-4/p-5/p-6)
Component Boundary
  ↓ Item Padding (p-3/p-4)
Content
```

## Mobile Layout (< 640px)

### Full Page Breakdown

```text
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN EDGE (0px)                                               │
│ ════════════════════════════════════════════════════════════════│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 16px (px-4) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Page
│ ▒┌──────────────────────────────────────────────────────────┐▒│ Padding
│ ▒│ HEADER                                                   │▒│
│ ▒│ [CheckSquare Icon] Todo App                             │▒│
│ ▒│ A Next.js Todo application...                           │▒│
│ ▒└──────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                     24px (mb-6)                            ▒│ Header
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────┐▒│
│ ▒│ CARD BORDER ┌────────────────────────────────────────┐   │▒│
│ ▒│             │ ░░░░░░░░ 16px (p-4) ░░░░░░░░░░░░░░░░░░│   │▒│ Card
│ ▒│             │ ░┌────────────────────────────────────┐░│   │▒│ Padding
│ ▒│             │ ░│ TodoForm                           │░│   │▒│
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
│ ▒│             │ ░│ │▓▓ 12px (p-3) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│
│ ▒│             │ ░│ │▓[☐] Buy milk          [Edit]▓│   │░│   │▒│ TodoItem
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12px▓│   │░│   │▒│ Padding
│ ▒│             │ ░│ └──────────────────────────────┘   │░│   │▒│
│ ▒│             │ ░│          8px (space-y-2)           │░│   │▒│ List
│ ▒│             │ ░│ ┌──────────────────────────────┐   │░│   │▒│ Gap
│ ▒│             │ ░│ │▓▓ 12px (p-3) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│
│ ▒│             │ ░│ │▓[☐] Walk dog          [Edit]▓│   │░│   │▒│
│ ▒│             │ ░│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12px▓│   │░│   │▒│
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
▒▒▒ = Page padding (px-4 = 16px horizontal)
░░░ = Card padding (p-4 = 16px all sides)
▓▓▓ = TodoItem padding (p-3 = 12px all sides)
```

### Spacing Measurements

| Visual Gap             | Created By    | Tailwind    | Pixels | File:Line           |
| ---------------------- | ------------- | ----------- | ------ | ------------------- |
| Screen edge → Header   | Page padding  | `px-4`      | 16px   | `page.tsx:41`       |
| Header → Card          | Header margin | `mb-6`      | 24px   | `page.tsx:42`       |
| Card border → Form     | Card padding  | `p-4`       | 16px   | `page.tsx:61`       |
| Form → Filter          | Form margin   | `mb-4`      | 16px   | `TodoForm.tsx:51`   |
| Filter → List          | Filter margin | `mb-4`      | 16px   | `TodoFilter.tsx:50` |
| Todo item → Todo item  | List gap      | `space-y-2` | 8px    | `TodoList.tsx:85`   |
| Item border → Checkbox | Item padding  | `p-3`       | 12px   | `TodoItem.tsx:287`  |
| Checkbox → Text        | Internal gap  | `gap-2`     | 8px    | `TodoItem.tsx:287`  |
| Text → Edit button     | Internal gap  | `gap-2`     | 8px    | `TodoItem.tsx:287`  |
| Card → Footer          | Card margin   | `mt-6`      | 24px   | `page.tsx:92`       |

## Desktop Layout (≥ 640px)

### Full Page Breakdown

```text
┌─────────────────────────────────────────────────────────────────────┐
│ SCREEN EDGE (0px)                                                   │
│ ════════════════════════════════════════════════════════════════════│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 24px (px-6) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Page
│ ▒┌──────────────────────────────────────────────────────────────┐▒│ Padding
│ ▒│ HEADER (larger text, more spacing)                          │▒│
│ ▒│ [CheckSquare Icon] Todo App                                 │▒│
│ ▒│ A Next.js Todo application built with TDD                   │▒│
│ ▒└──────────────────────────────────────────────────────────────┘▒│
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│ ▒                       32px (mb-8)                              ▒│ Header
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Margin
│ ▒┌──────────────────────────────────────────────────────────────┐▒│
│ ▒│ CARD BORDER ┌────────────────────────────────────────────┐   │▒│
│ ▒│             │ ░░░░░░░░░░ 20px (p-5) ░░░░░░░░░░░░░░░░░░░░│   │▒│ Card
│ ▒│             │ ░┌────────────────────────────────────────┐░│   │▒│ Padding
│ ▒│             │ ░│ TodoForm                               │░│   │▒│
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
│ ▒│             │ ░│ └──────────────────────────────────┘   │░│   │▒│
│ ▒│             │ ░│          12px (space-y-3)              │░│   │▒│ List
│ ▒│             │ ░│ ┌──────────────────────────────────┐   │░│   │▒│ Gap
│ ▒│             │ ░│ │▓▓▓ 16px (p-4) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░│   │▒│
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

### Spacing Measurements

| Visual Gap                | Created By    | Tailwind    | Pixels | File:Line           |
| ------------------------- | ------------- | ----------- | ------ | ------------------- |
| Screen edge → Header      | Page padding  | `px-6`      | 24px   | `page.tsx:41`       |
| Header → Card             | Header margin | `mb-8`      | 32px   | `page.tsx:42`       |
| Card border → Form        | Card padding  | `p-5`       | 20px   | `page.tsx:61`       |
| Form → Filter             | Form margin   | `mb-6`      | 24px   | `TodoForm.tsx:51`   |
| Filter → List             | Filter margin | `mb-4`      | 16px   | `TodoFilter.tsx:50` |
| Todo item → Todo item     | List gap      | `space-y-3` | 12px   | `TodoList.tsx:85`   |
| Item border → Drag handle | Item padding  | `p-4`       | 16px   | `TodoItem.tsx:287`  |
| Drag → Checkbox           | Internal gap  | `gap-3`     | 12px   | `TodoItem.tsx:287`  |
| Checkbox → Text           | Internal gap  | `gap-3`     | 12px   | `TodoItem.tsx:287`  |
| Text → Actions            | Internal gap  | `gap-3`     | 12px   | `TodoItem.tsx:287`  |
| Card → Footer             | Card margin   | `mt-8`      | 32px   | `page.tsx:92`       |

## Component Detail Views

### TodoItem Internal Spacing

#### Mobile (p-3 = 12px, gap-2 = 8px)

```text
┌────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12px padding (p-3) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ▓                                                      ▓│
│ ▓  [Checkbox]  ←8px→  Content Area  ←8px→  [Actions]  ▓│
│ ▓    44×44px   (gap-2)   (flex-1)   (gap-2)  44×44px  ▓│
│ ▓                                                      ▓│
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└────────────────────────────────────────────────────────┘
```

#### Desktop (p-4 = 16px, gap-3 = 12px)

```text
┌──────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 16px padding (p-4) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ▓                                                                ▓│
│ ▓  [Drag] ←12px→ [Checkbox] ←12px→ Content ←12px→ [↑↓][Actions] ▓│
│ ▓  44×44px(gap-3) 44×44px   (gap-3) (flex-1)(gap-3) 44×44px each ▓│
│ ▓                                                                ▓│
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└──────────────────────────────────────────────────────────────────┘
```

### TodoForm Internal Spacing

#### Mobile

```text
┌─────────────────────────────────────────────────────┐
│ Form Container (no direct padding)                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▓▓ 12px (px-3) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │
│ │ ▓ Textarea: "What needs to be done?"          ▓│ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12px (px-3)│ │
│ └─────────────────────────────────────────────────┘ │
│                    12px gap                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │  [+ Add Todo] (px-4 py-3 = 16px×12px padding)   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### Desktop

```text
┌──────────────────────────────────────────────────────────┐
│ Form Container (flex row, gap-3 = 12px)                  │
│ ┌────────────────────────────┐      ┌────────────────┐   │
│ │ ▓▓ 16px (px-4) ▓▓▓▓▓▓▓▓▓▓▓│←12px→│[+ Add Todo]    │   │
│ │ ▓ Textarea            ▓│ (gap) │(px-6 py-3)     │   │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓ 16px (px-4)│      │24px×12px       │   │
│ └────────────────────────────┘      └────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Common Scenarios: What Creates What

### "Vertical whitespace in the list"

**What it IS**:

- The gap between TodoItem components
- Controlled by: `TodoList.tsx:85` → `space-y-2 sm:space-y-3`
- Mobile: 8px, Desktop: 12px

**What it is NOT**:

- Padding inside TodoItem (that's `p-3/p-4`)
- Margin around TodoList container (that's TodoFilter's `mb-4`)
- Space between item content and buttons (that's `gap-2/gap-3`)

### "Horizontal spacing in items"

**What it IS**:

- Padding inside TodoItem creating space from border to content
- Controlled by: `TodoItem.tsx:287` → `p-3 sm:p-4`
- Mobile: 12px, Desktop: 16px

**What it is NOT**:

- Gap between checkbox and text (that's `gap-2/gap-3`)
- Page padding (that's `px-4/px-6`)
- Card padding (that's `p-4/p-5/p-6`)

### "Distance from screen edge"

**What it IS**:

- **Layer 1**: Page padding (`px-4 sm:px-6`) = 16px/24px
- **Layer 2**: Card padding (`p-4 sm:p-5`) = 16px/20px
- **Total**: 32px (mobile) / 44px (desktop) from edge to content

**What it is NOT**:

- Just page padding alone
- Just card padding alone
- The gap between items

## Screenshot Annotations Guide

When creating annotated screenshots (for future reference):

### Recommended Tools

1. **Browser DevTools**: Use "Inspect Element" to highlight spacing
2. **Excalidraw**: Add measurement annotations and arrows
3. **Figma**: Create overlay with spacing labels
4. **macOS Preview**: Use markup tools to add colored overlays

### Annotation Checklist

- [ ] Different colors for each spacing layer (page, card, item)
- [ ] Pixel measurements labeled clearly
- [ ] Tailwind class names included
- [ ] File:line references added
- [ ] Both mobile (393px) and desktop (≥640px) views
- [ ] Component boundaries clearly marked

### Color Coding Suggestion

- **Red**: Page padding (`px-4/px-6`, `py-6/py-8`)
- **Green**: Card padding (`p-4/p-5/p-6`)
- **Blue**: Component margins (`mb-4/mb-6/mb-8`)
- **Orange**: Item padding (`p-3/p-4`)
- **Purple**: Gaps (`space-y-2/3`, `gap-2/3`)

## Related Documentation

- [UI Layout Hierarchy](../ui-layout-hierarchy.md) - Component diagrams and spacing reference
- [Mobile UX Guidelines](../../guidelines/mobile-ux-guidelines.md) - Responsive spacing strategy
- [Accessibility Requirements](../../guidelines/accessibility-requirements.md) - Touch target sizing

## Usage

Reference these diagrams when:

- Discussing layout changes in PRs
- Identifying which spacing value to adjust
- Onboarding new developers
- Planning mobile UX improvements
- Debugging spacing issues

**Example**: "The 'vertical whitespace' you're referring to is the purple gap in the diagram -
that's the `space-y-2 sm:space-y-3` at TodoList.tsx:85"
