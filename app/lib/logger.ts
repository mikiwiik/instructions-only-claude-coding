/**
 * Structured logging module using Pino
 *
 * Features:
 * - Environment-aware log levels (debug in dev, info in prod)
 * - JSON output for production (Vercel log aggregation)
 * - Pretty-printed output for development
 * - Browser-compatible logging
 * - Child loggers for component context
 *
 * @see ADR-036 for logging strategy details
 */

import pino, { Logger } from 'pino';

const isServer = typeof window === 'undefined';
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
 * Browser-specific configuration
 * Logs as structured objects for consistency
 */
const browserConfig: pino.LoggerOptions = {
  ...baseConfig,
  browser: {
    asObject: true,
    // In production, only transmit errors to reduce noise
    transmit: isDev
      ? undefined
      : {
          level: 'error',
          send: (_level, logEvent) => {
            // Future: integrate with Sentry or other error tracking
            // For now, errors are captured by Sentry's global handler
            if (isDev) {
              console.log('[Logger Transmit]', logEvent);
            }
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
