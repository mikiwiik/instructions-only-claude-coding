/**
 * Structured logging module using Pino
 *
 * Features:
 * - Environment-aware log levels (debug in dev, info in prod)
 * - JSON output for production (Vercel log aggregation)
 * - Pretty-printed output for development
 * - Browser-compatible logging
 * - Child loggers for component context
 * - Sentry breadcrumb integration for error context
 *
 * @see ADR-036 for logging strategy details
 */

import * as Sentry from '@sentry/nextjs';
import pino, { Logger } from 'pino';

const isServer = globalThis.window === undefined;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Base Pino configuration
 */
const baseConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

/**
 * Map Pino log levels to Sentry breadcrumb severity
 * Exported for testing
 */
export function mapLevelToSentry(
  level: string
): 'fatal' | 'error' | 'warning' | 'info' | 'debug' {
  switch (level) {
    case 'fatal':
      return 'fatal';
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'debug';
  }
}

/**
 * Format log message for Sentry breadcrumb
 * Exported for testing
 */
export function formatLogMessage(message: unknown): string {
  return typeof message === 'string' ? message : JSON.stringify(message);
}

/**
 * Browser-specific configuration
 * Logs as structured objects for consistency
 * Integrates with Sentry for breadcrumb tracking
 */
const browserConfig: pino.LoggerOptions = {
  ...baseConfig,
  browser: {
    asObject: true,
    // In production, capture warn and error logs as Sentry breadcrumbs
    transmit: isDev
      ? undefined
      : {
          level: 'warn',
          /* istanbul ignore next -- browser-only production callback, inputs tested separately */
          send: (level, logEvent) => {
            Sentry.addBreadcrumb({
              category: 'log',
              message: formatLogMessage(logEvent.messages[0]),
              level: mapLevelToSentry(level),
              data: logEvent.bindings,
            });
          },
        },
  },
};

/**
 * Server-specific configuration
 * Uses pino-pretty for development readability
 */
const serverConfig: pino.LoggerOptions = {
  ...baseConfig,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
};

/**
 * Main logger instance
 * Automatically configured for browser or server environment
 */
export const logger: Logger = pino(isServer ? serverConfig : browserConfig);

/**
 * Create a child logger with additional context
 * Useful for adding request IDs, component names, etc.
 *
 * @example
 * const reqLogger = createChildLogger({ requestId: 'abc123', listId: 'xyz' });
 * reqLogger.info('Processing request');
 */
export function createChildLogger(bindings: pino.Bindings): Logger {
  return logger.child(bindings);
}

/**
 * Generate a unique request ID for tracing
 * Uses crypto.randomUUID when available, falls back to crypto.getRandomValues
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues (more widely supported than randomUUID)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Last resort fallback for environments without crypto
  return `req-${Date.now()}-${performance.now().toString(36)}`;
}

/**
 * Log level type for type-safe log level checks
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Check if a log level is enabled
 * Useful for avoiding expensive string operations when logging is disabled
 *
 * @example
 * if (isLogLevelEnabled('debug')) {
 *   logger.debug({ data: expensiveOperation() }, 'Debug info');
 * }
 */
export function isLogLevelEnabled(level: LogLevel): boolean {
  return logger.isLevelEnabled(level);
}

/**
 * Extract Vercel request ID from headers for log correlation
 * Returns the x-vercel-id header if present, otherwise generates a local ID
 *
 * @see https://vercel.com/docs/headers/request-headers
 */
export function getVercelRequestId(headers?: Headers): string {
  return headers?.get('x-vercel-id') || generateRequestId();
}
