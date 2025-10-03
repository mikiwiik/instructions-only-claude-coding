# Mobile UX Guidelines

**Status**: Living Document
**Last Updated**: 2025-10-03
**Related**:
[UI Layout Hierarchy](../design/ui-layout-hierarchy.md),
[Accessibility Requirements](./accessibility-requirements.md)

## Overview

This document defines mobile-first UX principles and spacing guidelines for the Todo application.
All implementations should prioritize mobile experiences while progressively enhancing for larger
screens.

## Mobile-First Philosophy

### Core Principles

1. **Mobile as Default**: Base styles target mobile devices (< 640px)
2. **Progressive Enhancement**: Use `sm:`, `md:`, `lg:` prefixes to enhance larger screens
3. **Touch-First Interaction**: All touch targets meet WCAG 2.2 AA (44×44px minimum)
4. **Content Prioritization**: Maximize visible content on small screens

### Target Devices

**Primary**: iPhone 14 (393×852px)
**Secondary**: iPhone SE (375×667px), Android equivalents
**Tablet**: iPad Mini (744×1133px) and up

## Responsive Breakpoints

### Breakpoint System

```text
Mobile:  0px - 639px    (default, no prefix)
Small:   640px+         (sm: prefix)
Medium:  768px+         (md: prefix)
Large:   1024px+        (lg: prefix)
```

### Usage Pattern

```tsx
// ✅ Correct: Mobile first, then enhance
className = 'p-3 sm:p-4 md:p-6';

// ❌ Incorrect: Desktop first
className = 'p-6 sm:p-4 md:p-3';
```

## Spacing Strategy

### Mobile Spacing Values

**Principle**: Use tighter spacing on mobile to maximize visible content without compromising readability or touch targets.

| Component      | Mobile                   | Desktop                     | Rationale                      |
| -------------- | ------------------------ | --------------------------- | ------------------------------ |
| Page padding   | `px-4 py-6` (16px, 24px) | `px-6 py-8` (24px, 32px)    | Breathing room from edges      |
| Card padding   | `p-4` (16px)             | `p-5` (20px) - `p-6` (24px) | Container spacing              |
| Item padding   | `p-3` (12px)             | `p-4` (16px)                | Individual todo spacing        |
| List gap       | `space-y-2` (8px)        | `space-y-3` (12px)          | Vertical spacing between items |
| Form margin    | `mb-4` (16px)            | `mb-6` (24px)               | Section separation             |
| Button padding | `px-4 py-3` (16px, 12px) | `px-6 py-3` (24px, 12px)    | Touch target + text spacing    |
| Internal gaps  | `gap-2` (8px)            | `gap-3` (12px)              | Between related elements       |
| Minimal gaps   | `gap-1` (4px)            | `gap-1` (4px)               | Tight grouping (button groups) |

### Spacing Scale Reference

**Tailwind → Pixel Conversion**:

```text
0   → 0px      1   → 4px      2   → 8px
3   → 12px     4   → 16px     5   → 20px
6   → 24px     8   → 32px     10  → 40px
12  → 48px     16  → 64px     20  → 80px
```

### Component-Specific Guidelines

#### Page Container

```tsx
// File: app/page.tsx:41
<div className="px-4 py-6 sm:px-6 sm:py-8">
```

- **Mobile**: 16px horizontal, 24px vertical
- **Desktop**: 24px horizontal, 32px vertical
- **Purpose**: Outer boundary, prevents content from touching edges

#### Main Card

```tsx
// File: app/page.tsx:61
<main className="p-4 sm:p-5 md:p-6">
```

- **Mobile**: 16px all sides
- **Small**: 20px all sides
- **Medium**: 24px all sides
- **Purpose**: Contains all interactive components

#### TodoItem

```tsx
// File: app/components/TodoItem.tsx:287
<li className="p-3 sm:p-4">
```

- **Mobile**: 12px all sides
- **Desktop**: 16px all sides
- **Purpose**: Individual todo padding

#### TodoList Gaps

```tsx
// File: app/components/TodoList.tsx:85
<ul className="space-y-2 sm:space-y-3">
```

- **Mobile**: 8px between items
- **Desktop**: 12px between items
- **Purpose**: Vertical rhythm

## Touch Targets

### WCAG 2.2 AA Compliance

**Minimum Size**: 44×44px for all interactive elements

### Implementation

All buttons and interactive elements use:

```tsx
className = 'min-w-[44px] min-h-[44px] flex items-center justify-center p-2';
```

- `p-2` provides 8px padding around icon
- Icon size: typically 16px (h-4 w-4)
- Total touch area: 8px + 16px + 8px = 32px minimum
- `min-w/min-h` ensures 44px even with small content

### Examples

**Checkbox Button** (`TodoItem.tsx:308`):

```tsx
<button className='p-2 min-w-[44px] min-h-[44px]'>
  <Circle className='h-5 w-5' />
</button>
```

**Action Buttons** (`TodoItem.tsx:348`):

```tsx
<button className='p-2 min-w-[44px] min-h-[44px]'>
  <Check className='h-4 w-4' />
</button>
```

**Drag Handle** (`TodoItem.tsx:301`):

```tsx
<div className='p-2 min-w-[44px] min-h-[44px]'>
  <GripVertical className='h-4 w-4' />
</div>
```

## Visual Hierarchy

### Distance from Screen Edge

#### Mobile (393px width)

**Horizontal Path to Content**:

```text
Screen Edge (0px)
├─ Page Padding: 16px (px-4)
├─ Card Border: ~1px
├─ Card Padding: 16px (p-4)
└─ Content Start: ~33px from edge
```

**Vertical Path to Main Content**:

```text
Screen Top (0px)
├─ Page Padding: 24px (py-6)
├─ Header: ~60px height
├─ Header Margin: 24px (mb-6)
├─ Card Border: ~1px
└─ Card Content: ~109px from top
```

#### Desktop (≥640px width)

**Horizontal Path to Content**:

```text
Screen Edge (0px)
├─ Page Padding: 24px (px-6)
├─ Card Border: ~1px
├─ Card Padding: 20px (p-5)
└─ Content Start: ~45px from edge
```

**Vertical Path to Main Content**:

```text
Screen Top (0px)
├─ Page Padding: 32px (py-8)
├─ Header: ~80px height
├─ Header Margin: 32px (mb-8)
├─ Card Border: ~1px
└─ Card Content: ~145px from top
```

## Component Spacing Map

### Visual Reference

See [UI Layout Hierarchy](../design/ui-layout-hierarchy.md) for detailed diagrams.

**Quick Lookup**:

| Component         | File:Line           | Mobile Spacing | Desktop Spacing        |
| ----------------- | ------------------- | -------------- | ---------------------- |
| Page Container    | `page.tsx:41`       | `px-4 py-6`    | `px-6 py-8`            |
| Main Card         | `page.tsx:61`       | `p-4`          | `p-5` (sm), `p-6` (md) |
| Header Margin     | `page.tsx:42`       | `mb-6`         | `mb-8`                 |
| TodoForm Margin   | `TodoForm.tsx:51`   | `mb-4`         | `mb-6`                 |
| TodoForm Textarea | `TodoForm.tsx:64`   | `px-3 py-3`    | `px-4 py-3`            |
| TodoForm Button   | `TodoForm.tsx:72`   | `px-4 py-3`    | `px-6 py-3`            |
| TodoFilter Margin | `TodoFilter.tsx:50` | `mb-4`         | `mb-4`                 |
| TodoFilter Gap    | `TodoFilter.tsx:50` | `gap-2`        | `gap-2`                |
| TodoFilter Button | `TodoFilter.tsx:58` | `px-3 py-2`    | `px-3 py-2`            |
| TodoList Gap      | `TodoList.tsx:85`   | `space-y-2`    | `space-y-3`            |
| TodoItem Padding  | `TodoItem.tsx:287`  | `p-3`          | `p-4`                  |
| TodoItem Gap      | `TodoItem.tsx:287`  | `gap-2`        | `gap-3`                |
| Footer Margin     | `page.tsx:92`       | `mt-6`         | `mt-8`                 |

## Mobile-Specific Patterns

### 1. Bottom Sheet Modal (Markdown Help)

**Context**: Full-width overlay on mobile for better readability

```tsx
// Mobile: Full-screen bottom sheet (45% height)
<div className="sm:hidden fixed inset-x-0 bottom-0 h-[45vh]">

// Desktop: Inline collapsible
<div className="hidden sm:block">
```

**Rationale**: Mobile screens need dedicated space for help content without obscuring the edit area.

See: [ADR-016](../adr/016-mobile-help-overlay-pattern.md) (pending in PR #166)

### 2. Reduced Border Radius

**Context**: Flat borders on mobile for more content area

```tsx
// Mobile: No rounded corners on list edge
<li className="rounded-lg border">

// Could be: rounded-none sm:rounded-lg for truly flat mobile
```

### 3. Responsive Text Sizing

```tsx
className = 'text-sm sm:text-base'; // Body text
className = 'text-xs sm:text-sm'; // Secondary text
className = 'text-2xl sm:text-3xl'; // Headings
```

## Best Practices

### DO ✅

- Start with mobile styles (no prefix)
- Use `sm:`, `md:`, `lg:` to enhance
- Test on actual device (iPhone 14, 393px)
- Maintain 44×44px touch targets
- Use tighter spacing on mobile
- Progressively add spacing on desktop

### DON'T ❌

- Start with desktop styles
- Use max-width media queries
- Make touch targets smaller than 44px
- Copy desktop spacing to mobile
- Add spacing that reduces visible content unnecessarily

## Testing Checklist

When implementing mobile layouts:

- [ ] Test on iPhone 14 (393px) or equivalent
- [ ] All touch targets ≥ 44×44px
- [ ] Content doesn't touch screen edges
- [ ] Adequate spacing between interactive elements
- [ ] No horizontal scrolling
- [ ] Text remains readable (min 16px for body)
- [ ] Responsive breakpoints work as expected

## Communication Guide

When discussing spacing changes, use this format:

**Format**: `[Component] → [Property] → [Current] → [Proposed]`

**Examples**:

✅ "TodoList → space-y → 8px mobile/12px desktop → 4px mobile/8px desktop"
✅ "TodoItem padding (TodoItem.tsx:287) → p-3 sm:p-4 → p-2 sm:p-3"
✅ "Vertical gap between todos → space-y-2 sm:space-y-3 → space-y-1 sm:space-y-2"

**Reference**:

- Component names from [UI Layout Hierarchy](../design/ui-layout-hierarchy.md)
- File:line references for precision
- Pixel values for clarity

## Related Documentation

- [UI Layout Hierarchy](../design/ui-layout-hierarchy.md) - Visual diagrams and spacing breakdown
- [Accessibility Requirements](./accessibility-requirements.md) - WCAG 2.2 AA compliance (44×44px touch targets)
- [Issue #163](https://github.com/user/repo/issues/163) - Mobile UX improvements context
- [PR #166](https://github.com/user/repo/pulls/166) - Mobile UX implementation

## Changelog

| Date       | Change                       | Rationale                                       |
| ---------- | ---------------------------- | ----------------------------------------------- |
| 2025-10-03 | Initial mobile UX guidelines | Issue #169 - Document spacing for better comms  |
| 2025-09-XX | Mobile spacing optimizations | PR #166 - Reduce padding for more visible items |
