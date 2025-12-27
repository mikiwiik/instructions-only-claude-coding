/**
 * Sentry configuration for Node.js and Edge runtimes.
 *
 * This file is imported by instrumentation.ts for server-side error tracking.
 * Uses shared config for consistency with client-side monitoring.
 */

import * as Sentry from '@sentry/nextjs';
import { sharedSentryConfig } from './sentry.shared';

Sentry.init({
  // Server-side DSN (not exposed to client)
  dsn: process.env.SENTRY_DSN,

  // Shared configuration
  ...sharedSentryConfig,
});
