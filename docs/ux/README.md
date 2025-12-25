# UX Design Documentation

This directory contains all user experience design documentation for the Todo App.

## Quick Reference

| Document                                                             | Purpose                               |
| -------------------------------------------------------------------- | ------------------------------------- |
| [Layout & Spacing](layout-and-spacing-reference.md)                  | Breakpoints, spacing system, layout   |
| [Mobile UX Guidelines](mobile-ux-guidelines.md)                      | Touch gestures, mobile-first patterns |
| [Accessibility Requirements](accessibility-requirements.md)          | WCAG 2.2 AA compliance                |

## Design Principles

The Todo App follows these UX principles:

1. **Mobile-First** - Design for mobile, enhance for desktop
2. **Touch-Friendly** - 44px minimum touch targets, swipe gestures
3. **Accessible** - WCAG 2.2 AA compliant, keyboard navigable
4. **Responsive** - Fluid layouts across all breakpoints

## Breakpoints

| Breakpoint | Width        | Target Devices          |
| ---------- | ------------ | ----------------------- |
| Mobile     | 320px-767px  | Phones                  |
| Tablet     | 768px-1023px | Tablets, small laptops  |
| Desktop    | 1024px+      | Laptops, desktops       |

## Touch Gestures

| Gesture     | Action            |
| ----------- | ----------------- |
| Swipe right | Complete todo     |
| Swipe left  | Delete todo       |
| Long press  | Edit todo         |
| Drag handle | Reorder todos     |

All gestures have keyboard alternatives for accessibility.

## Visual Assets

Layout diagrams are available in the [diagrams/](diagrams/) folder:

- `mobile-layout.svg` - Mobile viewport layout
- `desktop-layout.svg` - Desktop viewport layout

## Related Documentation

- [Platform Support](../architecture/platform-support.md) - Supported browsers and devices
- [Frontend Testing Checklist](../testing/frontend-testing-checklist.md) - Testing overview
- [Touch Gestures Feature](../features/touch-gestures.md) - Implementation details
