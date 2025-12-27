/**
 * Shared Sentry configuration used by both client and server runtimes.
 *
 * This ensures consistent error monitoring behavior across all environments.
 * Runtime-specific configs import and extend these settings.
 *
 * @see docs/setup/sentry-setup.md for setup instructions
 * @see docs/adr/032-error-monitoring-solution.md for decision rationale
 */

/**
 * Shared Sentry.init() options for all runtimes
 */
export const sharedSentryConfig = {
  // Environment for error categorization in Sentry dashboard
  environment: process.env.NODE_ENV,

  // Sample rates - lower in production for cost optimization on free tier
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Disable sending PII - we don't track user data (privacy-first)
  sendDefaultPii: false,

  // Only send errors in production to avoid noise during development
  enabled: process.env.NODE_ENV === 'production',
};
