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

// Sentry config options - only include source map upload settings if credentials are available
const sentryOptions = {
  // Suppress logs during local development
  silent: !process.env.CI,

  // Route Sentry requests through a tunnel to avoid ad blockers
  tunnelRoute: '/monitoring',

  // Hide source maps from users
  hideSourceMaps: true,

  // Disable telemetry
  telemetry: false,
};

// Only add source map upload config if all required env vars are present
if (
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_AUTH_TOKEN
) {
  sentryOptions.org = process.env.SENTRY_ORG;
  sentryOptions.project = process.env.SENTRY_PROJECT;
  sentryOptions.authToken = process.env.SENTRY_AUTH_TOKEN;
  sentryOptions.widenClientFileUpload = true;
}

module.exports = withSentryConfig(nextConfig, sentryOptions);
