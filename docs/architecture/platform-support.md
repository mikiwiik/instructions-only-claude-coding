# Platform Support

This document describes the browsers and platforms that are supported and tested for the Todo App.

## Browser Support Matrix

### Tested Browsers

| Browser       | Version | Environment | Device Type |
| ------------- | ------- | ----------- | ----------- |
| Chromium      | Latest  | CI + Local  | Desktop     |
| Firefox       | Latest  | Local only  | Desktop     |
| WebKit/Safari | Latest  | Local only  | Desktop     |
| Mobile Chrome | Latest  | Local only  | Pixel 5     |
| Mobile Safari | Latest  | Local only  | iPhone 12   |

### CI/CD Testing

The GitHub Actions CI pipeline runs E2E tests on **Chromium only** for speed. This catches the
majority of issues while keeping pipeline times reasonable.

```text
CI Browser: Chromium (Desktop Chrome)
Retries: 2 on failure
Workers: 1 (sequential for stability)
```

### Local Development Testing

Developers can run the full browser matrix locally:

```bash
# Run all browsers
npm run test:e2e

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Target Platforms

### Desktop

- **Minimum viewport**: 1024px width
- **Tested resolutions**: 1366px, 1440px, 1920px
- **Input methods**: Mouse, keyboard, trackpad
- **Features**: Hover states, keyboard shortcuts, focus management

### Tablet

- **Viewport range**: 768px - 1023px
- **Input methods**: Touch, optional keyboard
- **Features**: Touch gestures, responsive layout

### Mobile

- **Viewport range**: 320px - 767px
- **Tested devices**: iPhone SE (375px), iPhone 12 (390px), Pixel 5 (393px)
- **Input methods**: Touch only
- **Features**: Swipe gestures, long press, 44px touch targets

## Feature Support by Platform

| Feature             | Desktop | Tablet | Mobile |
| ------------------- | ------- | ------ | ------ |
| Keyboard navigation | Yes     | Yes    | No     |
| Hover states        | Yes     | No     | No     |
| Touch gestures      | No      | Yes    | Yes    |
| Drag & drop         | Yes     | Yes    | Yes    |
| Focus traps         | Yes     | Yes    | Yes    |
| Screen reader       | Yes     | Yes    | Yes    |

## Browser Feature Detection

The app uses feature detection for cross-browser compatibility:

### UUID Generation

```typescript
// Three-tier fallback (useTodoSync.ts)
1. crypto.randomUUID()     // Modern browsers
2. crypto.getRandomValues() // Older browsers
3. Date.now() based ID     // Last resort
```

### CSS Vendor Prefixes

- `-webkit-font-smoothing` for Safari/Chrome
- `-moz-osx-font-smoothing` for Firefox on macOS
- `-webkit-overflow-scrolling: touch` for iOS momentum scrolling
- Safe area insets for notched devices

## Known Limitations

### Not Tested

- Internet Explorer (not supported)
- Opera (not tested, likely works)
- Samsung Internet (not tested)
- UC Browser (not tested)

### Mobile Limitations

- iOS Safari has limited PWA support
- No offline mode UI (errors handled silently)
- Gesture conflicts possible with browser swipe-back on some devices

## Related Documentation

- [E2E Testing Guide](../testing/e2e-testing-guide.md) - Playwright configuration
- [Frontend Testing Checklist](../testing/frontend-testing-checklist.md) - Testing overview
- [Accessibility Requirements](../ux/accessibility-requirements.md) - WCAG compliance
- [Mobile UX Guidelines](../ux/mobile-ux-guidelines.md) - Touch interaction design
