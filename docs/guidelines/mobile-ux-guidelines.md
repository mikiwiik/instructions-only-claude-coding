# Mobile UX Guidelines

Comprehensive mobile user experience guidelines for the Todo App, based on real-world testing and
optimization on iPhone 14 and similar devices.

## Core Principles

1. **Mobile-First Design**: Optimize for mobile screens first, enhance for larger screens
2. **Maximum Screen Utilization**: Every pixel counts on mobile devices
3. **WCAG 2.2 AA Compliance**: Accessibility is non-negotiable
4. **Native-Like Feel**: Match platform conventions and user expectations

---

## iOS Safari Zoom Prevention

### The Problem

iOS Safari automatically zooms when users focus on input fields with font-size < 16px. This causes:

- Disorienting zoom behavior when tapping input fields
- Persistent zoom that doesn't reset after input
- Action buttons pushed partially off-screen
- Poor user experience requiring manual zoom-out

### The Solution

**1. Viewport Configuration** (Required)

```tsx
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents zoom persistence
};
```

**2. Minimum Font Size** (Required)

All input fields and textareas MUST use at least 16px font size:

```tsx
// ✅ CORRECT - Prevents zoom trigger
<textarea className="text-base" /> // 16px on all screens

// ❌ WRONG - Triggers iOS Safari zoom
<textarea className="text-sm sm:text-base" /> // 14px on mobile
```

### Guidelines

- **Always** use `text-base` (16px) or larger for all input fields
- **Never** use `text-sm` (14px) or smaller on mobile input fields
- **Test** on actual iOS devices (Safari zoom behavior doesn't occur in Chrome iOS)
- **Document** any exceptions with clear rationale in code comments

**Related**: Issue #163, PR #166 (Commits 10-11)

---

## Mobile Spacing Strategy

### Edge-to-Edge Layout Principle

On mobile devices (< 640px), maximize usable content area by removing unnecessary padding and using
borders for visual separation.

### Responsive Padding Patterns

#### Page Container

```tsx
// Remove outer padding on mobile, add on desktop
<div className="px-0 sm:px-6 py-6 sm:py-8">
```

#### Card/Section Components

```tsx
// Edge-to-edge on mobile, contained on desktop
<main className="p-0 sm:p-5 md:p-6 border-x-0 sm:border-x">
```

#### List Items

```tsx
// Compact on mobile, spacious on desktop
<li className="p-2 sm:p-4">
```

#### List Spacing

```tsx
// No spacing on mobile (borders separate), spacing on desktop
<ul className="space-y-0 sm:space-y-3">
```

### Border vs Spacing Strategy

#### Mobile (< 640px)

- Use `space-y-0` (no vertical spacing between items)
- Use `border-t` on items (except first) for visual separation
- Use `border-x-0` (no horizontal borders)
- Result: Clean edge-to-edge iOS-native feel

#### Desktop (≥ 640px)

- Use `space-y-3` (12px spacing between items)
- Use full borders (`border`) with rounded corners
- Add horizontal padding for contained look
- Result: Traditional card-based layout

### Example: TodoItem Component

```tsx
<li
  className={`
    p-2 sm:p-4
    rounded-none sm:rounded-lg
    ${isFirst ? 'border-t-0' : 'border-t'}
    border-x-0 sm:border
    border-b-0 sm:border-b
  `}
>
```

### Guidelines

- **Measure** actual viewport usage (should be 90-100% on mobile)
- **Test** on physical devices (393px iPhone 14, 375px iPhone SE)
- **Maintain** consistent patterns across components
- **Document** deviations from edge-to-edge with clear rationale

**Related**: Issue #163, PR #166 (Commits 8-9)

---

## Button Density and Touch Targets

### WCAG 2.2 AA Touch Target Requirements

**Non-Negotiable Rule**: All interactive elements MUST be at least **44×44 pixels**.

### Mobile Button Compaction Strategy

Reduce visual density while maintaining accessibility by adjusting padding and gaps, NOT minimum
sizes.

#### Button Padding

```tsx
// Reduce padding on mobile, normal on desktop
<button className="min-w-[44px] min-h-[44px] p-1.5 sm:p-2">
```

- Mobile: `p-1.5` = 6px padding
- Desktop: `p-2` = 8px padding
- Total touch target: 44×44px (maintained via min-w/min-h)

#### Button Group Gaps

```tsx
// Tight spacing on mobile, comfortable on desktop
<div className='flex gap-0.5 sm:gap-1'>
  <button>Edit</button>
  <button>Delete</button>
</div>
```

- Mobile: `gap-0.5` = 2px between buttons
- Desktop: `gap-1` = 4px between buttons
- Larger gaps: `gap-1 sm:gap-2` (4px → 8px)

### Full Button Example

```tsx
<button
  className='
    flex-shrink-0
    min-w-[44px] min-h-[44px]
    p-1.5 sm:p-2
    flex items-center justify-center
    rounded-full
    hover:bg-muted
    focus:outline-none focus:ring-2 focus:ring-ring
    transition-colors
  '
>
  <Icon className='h-4 w-4' />
</button>
```

### Guidelines

- **Never** reduce `min-w-[44px] min-h-[44px]` below 44px
- **Always** maintain 44×44px touch targets on mobile
- **Adjust** padding and gaps for density, not minimum sizes
- **Test** with accessibility tools (axe DevTools, Lighthouse)
- **Verify** touch targets with browser dev tools

**Related**: Issue #163, PR #166 (Commit 12)

---

## Responsive Component Patterns

### Bottom Drawer Pattern (Mobile Overlays)

Use bottom drawer modals for secondary content on mobile instead of inline expansion.

#### When to Use

- Help/reference content that would consume vertical space
- Content that needs more room than available inline
- Temporary overlays that don't require full-screen attention

#### Implementation

```tsx
// Responsive rendering
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 640);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

return isMobile ? (
  <BottomDrawer isOpen={isOpen} onClose={onClose}>
    {content}
  </BottomDrawer>
) : (
  <InlineContent>{content}</InlineContent>
);
```

#### Bottom Drawer Specifications

- Height: 40-50% of viewport height (`h-[45vh]`)
- Width: 100% viewport width
- Position: Fixed at bottom, slides up
- Animation: 0.3s cubic-bezier slide-up
- Backdrop: Semi-transparent overlay
- Dismissal: Escape key, backdrop click, close button
- Focus trap: Enabled while open
- Body scroll: Locked while open

### Guidelines

- **Breakpoint**: 640px (sm) for mobile vs desktop rendering
- **Portal**: Use React portals for overlays (`createPortal`)
- **Accessibility**: Include focus trap and ARIA attributes
- **Animation**: Keep animations under 300ms for responsiveness
- **Testing**: Verify on actual mobile devices

**Related**: ADR-016, Issue #163, PR #166 (Commits 1-3)

---

## Typography for Mobile

### Font Size Guidelines

#### Input Fields (Critical for iOS)

- Minimum: `text-base` (16px) on all screens
- Rationale: Prevents iOS Safari auto-zoom

#### Body Text

- Mobile: `text-sm` (14px) minimum
- Tablet/Desktop: `text-base` (16px) preferred
- Example: `text-sm sm:text-base`

#### Headings

```tsx
// Responsive heading sizes
<h1 className="text-2xl sm:text-3xl md:text-4xl">
<h2 className="text-xl sm:text-2xl md:text-3xl">
<h3 className="text-base sm:text-lg md:text-xl">
```

#### Helper Text

```tsx
// Small but readable
<p className="text-xs sm:text-sm">
```

### Readability Guidelines

- **Line Height**: 1.4+ for body text (`leading-relaxed`)
- **Line Length**: 45-75 characters optimal (use `max-w-prose`)
- **Text Wrapping**: `break-words` for long strings
- **Whitespace**: `text-balance` for headings to prevent orphans

---

## Testing Checklist

### iOS Safari Zoom

- [ ] All input fields use 16px+ font size
- [ ] Viewport meta tag includes `maximumScale: 1`
- [ ] Test on actual iOS device (simulator doesn't replicate zoom behavior)
- [ ] Verify no zoom occurs when focusing any input

### Screen Utilization

- [ ] Measure viewport usage (should be 90-100% on mobile)
- [ ] iPhone 14 (393px): Verify edge-to-edge layout
- [ ] iPhone SE (375px): Verify no horizontal scroll
- [ ] Count visible todos (should be 7+ on iPhone 14)

### Touch Targets

- [ ] All buttons measure 44×44px minimum
- [ ] Use browser dev tools to verify touch target overlay
- [ ] Run Lighthouse accessibility audit (should pass)
- [ ] Test with accessibility tools (axe DevTools)

### Visual Quality

- [ ] No horizontal scroll on any mobile device
- [ ] Borders align cleanly at viewport edges
- [ ] Button spacing feels balanced
- [ ] Typography is readable at all sizes

---

## Common Pitfalls

### ❌ Anti-Patterns to Avoid

#### 1. Small Font Sizes on Inputs

```tsx
// ❌ WRONG - Triggers iOS zoom
<input className="text-sm" />

// ✅ CORRECT
<input className="text-base" />
```

#### 2. Reducing Touch Targets

```tsx
// ❌ WRONG - Too small for reliable tapping
<button className="min-w-[32px] min-h-[32px]">

// ✅ CORRECT - WCAG compliant
<button className="min-w-[44px] min-h-[44px]">
```

#### 3. Inconsistent Spacing Patterns

```tsx
// ❌ WRONG - Random padding values
<div className="px-3">
  <div className="px-2">
    <div className="px-4">

// ✅ CORRECT - Consistent responsive pattern
<div className="px-0 sm:px-6">
  <div className="p-2 sm:p-4">
```

#### 4. Forgetting Responsive Variants

```tsx
// ❌ WRONG - Mobile-only or desktop-only
<button className="p-1.5">

// ✅ CORRECT - Responsive
<button className="p-1.5 sm:p-2">
```

---

## Measurement and Verification

### Viewport Width Calculation

#### Example: iPhone 14 (393px width)

```text
Total viewport:           393px (100%)
- Outer padding (px-4):   -32px (16px × 2)
= Usable content width:   361px (92%)
```

#### After optimization (px-0)

```text
Total viewport:           393px (100%)
- Outer padding (px-0):     0px
= Usable content width:   393px (100%)
```

**Improvement**: +32px (8% more usable space)

### Touch Target Verification

Use browser dev tools to overlay touch target sizes:

1. Open Chrome DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Enable "Show rulers" and "Show media queries"
4. Inspect element → Computed → Verify width/height ≥ 44px

---

## Design Tokens Reference

### Spacing Scale

```text
gap-0.5 = 2px   (tight mobile button groups)
gap-1   = 4px   (normal mobile button groups)
gap-2   = 8px   (desktop button groups)
gap-3   = 12px  (list item spacing desktop)

p-1.5   = 6px   (compact mobile button padding)
p-2     = 8px   (normal mobile/desktop item padding)
p-4     = 16px  (spacious desktop item padding)
p-5     = 20px  (desktop container padding)
```

### Breakpoints

```text
sm:  640px  (tablet/desktop transition)
md:  768px  (larger tablets)
lg:  1024px (desktop)
```

### Touch Target Sizes

```text
min-w-[44px] min-h-[44px]  (WCAG 2.2 AA minimum)
min-w-[48px] min-h-[48px]  (More comfortable, AAA recommended)
```

---

## Related Documentation

- **Component Layout Reference**: [Visual diagrams and spacing mechanics](../design/component-layout-reference.md)
  for all UI components
- **UI Layout Hierarchy**: [Technical spacing documentation](../design/ui-layout-hierarchy.md) with component
  breakdowns
- **ADR-016**: Mobile Help Overlay Pattern (bottom drawer decision)
- **Accessibility Requirements**: WCAG 2.2 AA compliance guidelines
- **Responsive Design Checklist**: Comprehensive testing procedures
- **Touch Gestures Documentation**: Swipe and long-press patterns

---

_These guidelines are based on real-world optimization for iPhone 14 and similar devices, documented
in Issue #163 and PR #166._
