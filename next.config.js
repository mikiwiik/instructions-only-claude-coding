const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict TypeScript checking
    ignoreBuildErrors: false,
  },
  // Note: ESLint config removed - Next.js 16 no longer supports eslint in next.config.js
  // ESLint is run separately via npm run lint
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry organization and project (configured via environment variables)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress logs during local development
  silent: !process.env.CI,

  // Upload source maps for readable stack traces
  // Auth token is required only in CI for source map upload
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload larger set of source maps for better stack traces
  widenClientFileUpload: true,

  // Route Sentry requests through a tunnel to avoid ad blockers
  // This creates a /monitoring endpoint that proxies to Sentry
  tunnelRoute: '/monitoring',

  // Disable Sentry SDK in test and E2E environments
  disableSDKInProductionForTesting:
    process.env.NODE_ENV === 'test' ||
    process.env.USE_IN_MEMORY_STORE === 'true',

  // Hide source maps from users
  hideSourceMaps: true,

  // Disable telemetry
  telemetry: false,
});
