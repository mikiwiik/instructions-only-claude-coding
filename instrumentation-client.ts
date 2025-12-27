import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment for error categorization
  environment: process.env.NODE_ENV,

  // Sample rates - lower in production for cost optimization
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Disable default integrations we don't need for a simple todo app
  // This keeps the bundle size minimal
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Disable sending PII - we don't track user data
  sendDefaultPii: false,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Filter out low-value errors
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
