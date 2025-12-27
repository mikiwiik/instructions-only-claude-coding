/**
 * Sentry configuration for client-side (browser) runtime.
 *
 * This file is automatically loaded by Next.js for client-side error tracking.
 * Extends shared config with client-specific settings like error filtering.
 */

import * as Sentry from '@sentry/nextjs';
import { sharedSentryConfig } from './sentry.shared';

Sentry.init({
  // Client-side DSN (must use NEXT_PUBLIC_ prefix to be available in browser)
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Shared configuration
  ...sharedSentryConfig,

  // Client-specific: Disable replay features to minimize bundle size
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Client-specific: Filter out low-value errors
  beforeSend(event) {
    // Don't send network errors that are likely user connectivity issues
    if (
      event.exception?.values?.some(
        (e) => e.type === 'TypeError' && e.value?.includes('Failed to fetch')
      )
    ) {
      return null;
    }
    return event;
  },
});

// Export router transition tracking for Next.js App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
