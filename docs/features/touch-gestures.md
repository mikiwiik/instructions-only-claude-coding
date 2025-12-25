# Touch Gestures

## Overview

The Todo App includes comprehensive touch gesture support for mobile and touch-enabled devices, providing intuitive,
native-feeling interactions while maintaining full accessibility compliance with WCAG 2.2 AA standards.

## Available Gestures

### Swipe Right → Complete Todo

- **Action**: Mark a todo as completed
- **Keyboard Alternative**: Click/tap the circle checkbox button
- **Screen Reader**: "Toggle todo: [todo text]"

### Swipe Left → Delete Todo

- **Action**: Open delete confirmation dialog
- **Keyboard Alternative**: Click/tap the delete (X) button
- **Screen Reader**: "Delete todo: [todo text]"

### Long Press → Edit Mode

- **Action**: Enter edit mode for the todo
- **Keyboard Alternative**: Click/tap the edit (pencil) button
- **Screen Reader**: "Edit todo: [todo text]"

## Accessibility Compliance

All gesture interactions comply with **WCAG 2.2 AA** standards:

### SC 2.5.7: Dragging Movements (Level AA)

- ✅ All swipe and drag gestures have single-pointer alternatives (buttons)
- ✅ No action requires a gesture as the only input method

### SC 2.5.8: Target Size (Minimum) (Level AA)

- ✅ All interactive buttons meet 44×44px minimum touch target size
- ✅ Adequate spacing between touch targets

### Additional Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all actions
- **Screen Reader Support**: Descriptive ARIA labels for all interactive elements
- **Focus Management**: Clear focus indicators on all interactive elements
- **Visual Feedback**: Animations and transitions provide clear action feedback

## Implementation Details

### Custom Hooks

**`useSwipeGesture`**

- Detects horizontal swipe gestures with configurable thresholds
- Minimum swipe distance: 100px (default)
- Maximum vertical movement: 80px (default)
- Triggers appropriate callbacks for left/right swipes

**`useLongPress`**

- Detects long press (500ms default)
- Cancels on touch move or early release
- Works for both touch and mouse events

### Gesture Hints

First-time users see an informative hint box explaining available gestures and accessibility alternatives. The hint
can be dismissed and won't appear again (stored in localStorage).

## Testing

### Unit Tests

- `app/__tests__/hooks/useSwipeGesture.test.ts` - Swipe gesture detection logic
- `app/__tests__/hooks/useLongPress.test.ts` - Long press gesture detection logic

### Integration Tests

- `app/__tests__/components/TodoItem.gestures.test.tsx` - Gesture integration with TodoItem
- `app/__tests__/components/GestureHint.test.tsx` - Gesture hint component

### Accessibility Testing

- ✅ All touch targets verified to meet 44×44px minimum
- ✅ Keyboard alternatives tested for all gestures
- ✅ ARIA labels validated for screen reader support
- ✅ Focus management tested for keyboard navigation

## Browser Compatibility

Touch gestures work across:

- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Desktop browsers with touch screens
- ✅ Mouse-only devices (via button alternatives)
- ✅ Keyboard-only navigation (via button alternatives)

## Future Enhancements

Potential improvements tracked in GitHub issues:

- Pull-to-refresh for todo list
- Pinch-to-zoom for accessibility
- Haptic feedback on gesture completion (where supported)
- Customizable gesture settings/preferences

## Mobile UX Patterns

The todo app uses consistent mobile-optimized patterns:

- **Gesture Hints**: Fixed bottom banner for simple notifications
- **Markdown Help**: Bottom drawer modal for reference content (< 640px viewports)
  - Full-width display (45% viewport height)
  - Preserves textarea and action button visibility
  - See [ADR-016: Mobile Help Overlay Pattern](../adr/016-mobile-help-overlay-pattern.md)

## References

- [WCAG 2.2 SC 2.5.7: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Accessibility Requirements](../ux/accessibility-requirements.md)
- [ADR-012: Todo Reordering UX Approach](../adr/012-todo-reordering-ux-approach.md)
- [ADR-016: Mobile Help Overlay Pattern](../adr/016-mobile-help-overlay-pattern.md)
