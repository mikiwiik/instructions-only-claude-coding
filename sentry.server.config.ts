import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environment for error categorization
  environment: process.env.NODE_ENV,

  // Sample rates - lower in production for cost optimization
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Disable sending PII - we don't track user data
  sendDefaultPii: false,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',
});
