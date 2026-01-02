/**
 * Monitoring utilities for error tracking and custom events.
 *
 * This module provides a thin abstraction over Sentry to:
 * - Track rate limit events (warning, blocked)
 * - Report custom errors with context
 * - Allow easy swapping of monitoring backends if needed
 *
 * @see ADR-032 for the error monitoring solution selection
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

/**
 * Rate limit event types for categorization in Sentry
 */
export type RateLimitEventType = 'warning' | 'blocked';

/**
 * Metadata for rate limit events
 */
export interface RateLimitMetadata {
  /** The list ID being accessed */
  listId?: string;
  /** Client IP address (hashed or partial for privacy) */
  clientIp?: string;
  /** Remaining requests before limit */
  remaining?: number;
  /** Time until limit resets (ms) */
  resetIn?: number;
  /** The endpoint being rate limited */
  endpoint?: string;
}

/**
 * Track a rate limit event in Sentry.
 *
 * Use this function when rate limiting middleware detects abuse patterns:
 * - 'warning': User is approaching rate limit (e.g., 80% consumed)
 * - 'blocked': Request was blocked due to rate limit exceeded
 *
 * @example
 * // When user hits 80% of rate limit
 * trackRateLimitEvent('warning', { listId: 'abc123', remaining: 6 });
 *
 * @example
 * // When request is blocked
 * trackRateLimitEvent('blocked', { listId: 'abc123', endpoint: '/api/shared/abc123/sync' });
 */
export function trackRateLimitEvent(
  type: RateLimitEventType,
  metadata: RateLimitMetadata
): void {
  // Don't track in development or test environments
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.USE_IN_MEMORY_STORE === 'true'
  ) {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.info({ type, ...metadata }, `Rate limit ${type}`);
    }
    return;
  }

  Sentry.captureMessage(`Rate limit ${type}`, {
    level: type === 'blocked' ? 'warning' : 'info',
    tags: {
      category: 'rate-limit',
      'rate-limit.type': type,
      ...(metadata.endpoint && { 'rate-limit.endpoint': metadata.endpoint }),
    },
    extra: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Capture an application error with additional context.
 *
 * Use this for errors that need extra context beyond what Sentry
 * automatically captures.
 *
 * @example
 * try {
 *   await syncTodos(listId);
 * } catch (error) {
 *   captureError(error, { listId, operation: 'sync' });
 * }
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  // Always log for development visibility
  logger.error({ error, ...context }, '[App Error]');

  // Don't send to Sentry in non-production
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.USE_IN_MEMORY_STORE === 'true'
  ) {
    return;
  }

  Sentry.captureException(error, {
    extra: {
      ...context,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Set user context for Sentry (if we ever add authentication).
 * For now, this is a placeholder that does nothing since we're anonymous.
 */
export function setUserContext(userId: string | null): void {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}
