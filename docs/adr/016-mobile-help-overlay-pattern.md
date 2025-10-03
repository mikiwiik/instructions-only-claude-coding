# ADR-016: Mobile Help Overlay Pattern

## Status

Accepted

## Context

The Todo App has two types of help/informational content for users:

1. **Gesture Hints** (PR #158): First-time user onboarding showing available touch gestures
2. **Markdown Help**: Reference documentation for markdown syntax while editing todos

Both need to be accessible on mobile devices with limited screen real estate. On iPhone 14 (393px width), the
current inline Markdown Help popup is too narrow (~217px, only 55% of screen width) to effectively display syntax
examples and descriptions.

### Design Constraints

For mobile help overlays, we must balance:

- **Content readability**: Help content needs adequate width to be useful
- **Context preservation**: Users must see the content they're editing/working with
- **Action accessibility**: Primary actions (Save/Cancel buttons, input fields) must remain visible and accessible
- **Consistency**: Similar UI patterns should feel cohesive across the app
- **WCAG 2.2 AA compliance**: Touch targets, focus management, keyboard navigation

### Current Implementations

**GestureHint** (`app/components/GestureHint.tsx:30-36`):

- Fixed position banner at screen bottom
- Simple dismissible notification pattern
- One-time display (localStorage persistence)
- Light theme (blue-50 background)
- Static height, no scrolling needed

**MarkdownHelpBox** (`app/components/MarkdownHelpBox.tsx:20`):

- Inline collapsible component
- Dark theme (gray-800 background)
- Rendered within TodoItem edit layout
- Constrained by parent container width
- Scrollable content with multiple sections

## Decision

We will adopt the **Bottom Drawer/Sheet pattern** for mobile help overlays that require substantial content display
while preserving user context.

### Pattern Specifications

**Bottom Drawer Pattern** (for reference content like Markdown Help):

- Slides up from bottom of viewport
- Occupies 40-50% of viewport height
- Full width (100% viewport width)
- Dark theme matching existing MarkdownHelpBox aesthetic
- Scrollable content area
- Drag handle for dismissal affordance
- Backdrop overlay (rgba(0,0,0,0.4))
- Portal-based rendering (outside parent constraints)
- z-index: 100+ (above main content)

**Fixed Banner Pattern** (for simple notifications like GestureHint):

- Fixed position at bottom of screen
- Minimal height, no scrolling
- Light/contextual theme (blue/info colors)
- Simple close button
- Inline rendering (no portal needed)
- z-index: 50

### When to Use Each Pattern

| Pattern       | Use Case                                                | Examples                                           |
| ------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Bottom Drawer | Reference content, multi-section help, scrollable lists | Markdown syntax help, keyboard shortcuts reference |
| Fixed Banner  | Simple notifications, hints, single-action prompts      | Gesture hints, cookie consent, offline status      |

### Responsive Behavior

**Mobile (< 640px)**:

- Bottom drawer for markdown help
- Fixed banner for notifications

**Desktop (≥ 640px)**:

- Return to inline collapsible for markdown help
- Fixed corner banner for notifications

## Consequences

### Positive

- **Consistent UX patterns**: Clear distinction between notifications and reference content
- **Improved readability**: Bottom drawer provides ~90-95% viewport width for help content
- **Context preservation**: Textarea and action buttons remain visible above drawer
- **Mobile-first design**: Optimized for primary use case (mobile touch devices)
- **Scalability**: Pattern can be reused for future help content (keyboard shortcuts, feature tours, etc.)
- **Accessibility maintained**: Proper focus trap, ARIA attributes, keyboard dismissal

### Negative

- **Implementation complexity**: Requires portal-based rendering and modal management
- **Testing overhead**: Additional interaction tests for drawer open/close/swipe behaviors
- **Code duplication risk**: Need to maintain both mobile (drawer) and desktop (inline) implementations
- **Animation performance**: Drawer slide animations must be smooth to avoid janky UX

### Neutral

- **Pattern divergence**: Help content uses different patterns on mobile vs desktop (acceptable trade-off for UX optimization)
- **Dependencies**: May require additional libraries (or custom implementation) for drawer/sheet component

## Alternatives Considered

### Alternative 1: Floating Centered Modal (Option B)

**Description**: Center a modal dialog (85% width, 50% height) over the current content with backdrop.

**Pros**:

- Familiar modal pattern
- Easier to implement than bottom drawer
- Works on all screen sizes

**Cons**:

- Obscures textarea and action buttons (violates context preservation requirement)
- Less mobile-native feel
- User must dismiss to see their work

**Rejection Reason**: Fails to meet "action accessibility" constraint - buttons may be hidden behind modal.

### Alternative 2: Full-Width Inline Banner (Option C)

**Description**: Expand MarkdownHelpBox inline to full width within TodoItem, rendering between textarea and buttons.

**Pros**:

- Simplest implementation (no portal needed)
- Full width achieved
- Everything remains in DOM flow

**Cons**:

- Pushes action buttons off-screen on small viewports
- Creates jarring layout shift when expanded
- Scrolling required to reach buttons
- Not as mobile-native feeling

**Rejection Reason**: Pushes critical action buttons (Save/Cancel) out of view, forcing scroll to complete edit action.

### Alternative 3: Keep Current Inline Pattern

**Description**: Accept narrow help popup as acceptable mobile UX.

**Pros**:

- No additional work required
- Simple implementation

**Cons**:

- Poor readability on mobile (primary use case)
- User feedback indicates it's "nearly useless"
- Wasted screen real estate

**Rejection Reason**: Fails to address core UX problem reported by users.

## References

- [Issue #163: Mobile UX improvements](https://github.com/mikiwiik/instructions-only-claude-coding/issues/163)
- [PR #158: Touch gesture support](https://github.com/mikiwiik/instructions-only-claude-coding/pull/158)
- [GestureHint Component](../app/components/GestureHint.tsx)
- [MarkdownHelpBox Component](../app/components/MarkdownHelpBox.tsx)
- [Material Design: Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview)
- [iOS Human Interface Guidelines: Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [WCAG 2.2 SC 2.5.8: Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
