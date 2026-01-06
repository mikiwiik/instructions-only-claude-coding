# ADR-036: System Logging Strategy with Pino

## Status

Accepted

## Context

The application currently has minimal logging:

- Only 3 `console.error` calls in the codebase (sync-queue.ts, sync/route.ts)
- No structured logging framework
- No log aggregation or monitoring capability
- No differentiation between development and production log output
- No request tracing or correlation

Production applications require proper observability for:

- Debugging production issues
- Monitoring application health
- Tracking user-facing errors
- Performance analysis
- Security audit trails

### Library Comparison

| Feature            | Pino         | Winston            | Bunyan      |
| ------------------ | ------------ | ------------------ | ----------- |
| Performance        | 5-10x faster | Moderate           | Moderate    |
| Browser Support    | Yes          | No (requires 'fs') | No          |
| JSON Output        | Native       | Plugin             | Native      |
| Next.js Compatible | Yes          | Server-only        | Server-only |
| Bundle Size        | Small        | Large              | Medium      |
| Active Maintenance | Yes (2025)   | Yes                | Limited     |

## Decision

Adopt **Pino** as the system logging library with the following configuration:

### Logger Configuration

```typescript
// app/lib/logger.ts
import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const isServer = typeof globalThis.window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  browser: {
    asObject: true,
    transmit: isDev
      ? undefined
      : {
          level: 'warn',
          send: (level, logEvent) => {
            // Add as Sentry breadcrumb for error context
            Sentry.addBreadcrumb({
              category: 'log',
              message: logEvent.messages[0],
              level: mapLevelToSentry(level.label),
              data: logEvent.bindings,
            });
          },
        },
  },
  ...(isServer &&
    isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
});
```

### Sentry Breadcrumb Integration

In production browser environments, warn and error log entries are automatically
added as Sentry breadcrumbs. When an error occurs, Sentry error reports include
the log trail leading up to the error, providing valuable debugging context.

**Benefits:**

- No additional Sentry quota usage (breadcrumbs are included with errors)
- Automatic context for all captured errors
- Log entries preserved even if error occurs later

### Log Levels

| Level | Usage                        | Example                      |
| ----- | ---------------------------- | ---------------------------- |
| error | Failures requiring attention | API errors, sync failures    |
| warn  | Recoverable issues           | Retry attempts, deprecations |
| info  | Significant events           | API requests, state changes  |
| debug | Development details          | Function flow, state dumps   |

### ESLint Enforcement

```json
{
  "rules": {
    "no-console": ["error", { "allow": [] }]
  }
}
```

### What to Log

**Include:**

- Request ID for tracing
- Operation type and result
- Error messages and stack traces
- Performance metrics (duration)
- Anonymized identifiers (listId, participantId)

**Exclude (PII/Security):**

- Todo text content (log IDs only)
- IP addresses (full)
- Authentication tokens
- Personal identifiers

## Consequences

### Positive

- **Observability**: Structured JSON logs enable log aggregation and analysis
- **Performance**: Pino's async logging minimizes overhead
- **Debugging**: Request tracing and context improve troubleshooting
- **Consistency**: ESLint rule prevents ad-hoc console usage
- **Vercel Integration**: JSON output works with Vercel's log viewer

### Negative

- **Dependency**: Adds pino (~50KB) and pino-pretty (~100KB dev)
- **Learning Curve**: Team must use logger instead of console
- **Migration**: Existing console calls must be converted

### Neutral

- Log output changes from plain text to JSON in production
- Development uses pretty-printed output for readability

## Implementation

1. Install dependencies: `pino@9.6.0`, `pino-pretty@13.0.0` (dev)
2. Create `app/lib/logger.ts` with environment-aware configuration
3. Replace all `console.*` calls with appropriate `logger.*` calls
4. Add request logging to API routes
5. Configure ESLint `no-console` rule
6. Update documentation with logging guidelines

## References

- [Pino Documentation](https://getpino.io/)
- [Vercel Runtime Logs](https://vercel.com/docs/observability/runtime-logs)
- Issue #197: Infrastructure: Implement system logging with Pino
