/**
 * Application configuration constants.
 *
 * This module centralizes configuration values that may need to be adjusted
 * across the application. For values that should vary by deployment environment,
 * use environment variables instead.
 *
 * @see Issue #413 for comprehensive config system planning
 */

/**
 * Rate limiting configuration.
 *
 * These values configure the server-side rate limiting (middleware.ts)
 * and client-side fallback handling (useTodoSync.ts).
 *
 * @see ADR-033 for rate limiting architecture decision
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Maximum requests allowed per window.
   * Used by middleware sliding window limiter.
   */
  MAX_REQUESTS: 30,

  /**
   * Time window in seconds for rate limiting.
   * Combined with MAX_REQUESTS: 30 requests per 30 seconds.
   */
  WINDOW_SECONDS: 30,

  /**
   * Window duration string for Upstash ratelimit.
   * Format: "{number} {unit}" where unit is s, m, h, d
   */
  WINDOW_DURATION: '30 s',

  /**
   * Redis key prefix for rate limit entries.
   * Helps identify rate limit keys in Redis.
   */
  KEY_PREFIX: 'ratelimit:api',
} as const;

/**
 * Default values for rate limit response headers.
 *
 * Used as fallbacks when server doesn't return expected headers.
 * This can happen with misconfigured proxies or during development.
 */
export const RATE_LIMIT_DEFAULTS = {
  /**
   * Default retry-after value in seconds.
   * Used when Retry-After header is missing from 429 response.
   */
  RETRY_AFTER_SECONDS: 30,

  /**
   * Default rate limit value.
   * Used when X-RateLimit-Limit header is missing.
   */
  LIMIT: 30,

  /**
   * Default remaining requests value.
   * Used when X-RateLimit-Remaining header is missing.
   */
  REMAINING: 0,

  /**
   * Default reset timestamp.
   * Used when X-RateLimit-Reset header is missing.
   * Value of 0 indicates unknown reset time.
   */
  RESET: 0,
} as const;

/**
 * Sync configuration for backend communication.
 */
export const SYNC_CONFIG = {
  /**
   * Default debounce delay in milliseconds.
   * Prevents rapid-fire API calls during drag-and-drop or rapid edits.
   */
  DEFAULT_DEBOUNCE_DELAY_MS: 300,
} as const;
