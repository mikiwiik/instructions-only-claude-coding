# Logging Guidelines

## Purpose

This guide establishes structured logging standards for the Todo App using Pino. It ensures consistent, queryable logs
across development and production environments.

## Related Documentation

- **ADR-036**: System Logging Strategy with Pino (decision rationale)
- **eslint.config.mjs**: Enforces `no-console` rule (ADR-036 reference)
- **app/lib/logger.ts**: Logger implementation

## Core Principle

**Never use `console.*` methods directly.** All logging must go through the structured logger module. ESLint enforces
this with the `no-console` rule at error level.

## Logger Module

### Import

```typescript
import { logger, createChildLogger, generateRequestId } from '@/lib/logger';
```

### Basic Usage

```typescript
// Simple messages
logger.info('Operation completed');
logger.error('Operation failed');

// With structured context (preferred)
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ error, requestId }, 'Request failed');
```

## Log Levels

Use the appropriate level for each message:

| Level   | When to Use                            | Example                           |
| ------- | -------------------------------------- | --------------------------------- |
| `error` | Errors requiring attention             | API failures, unhandled errors    |
| `warn`  | Potential issues, recoverable problems | Deprecated usage, retry attempts  |
| `info`  | Significant events, request completion | Request completed, sync finished  |
| `debug` | Development troubleshooting            | State changes, intermediate steps |
| `trace` | Detailed debugging (rarely used)       | Loop iterations, low-level ops    |

### Environment Defaults

- **Development**: `debug` level (shows debug and above)
- **Production**: `info` level (shows info and above)
- **Override**: Set `LOG_LEVEL` environment variable

## Structured Logging Patterns

### Request Logging

Always include request ID and timing for API routes:

```typescript
export async function POST(request: NextRequest, { params }) {
  const requestId = generateRequestId();
  const log = createChildLogger({ requestId, listId, method: 'POST' });
  const startTime = Date.now();

  try {
    // ... operation
    const duration = Date.now() - startTime;
    log.info({ duration, itemCount: result.length }, 'Operation completed');
    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error({ error, duration }, 'Operation failed');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Child Loggers

Create child loggers for component-specific context:

```typescript
// API route with request context
const log = createChildLogger({
  requestId: generateRequestId(),
  listId: params.listId,
  method: 'POST',
});

// Hook with component context
const log = createChildLogger({ component: 'useTodoSync', listId });
```

### Error Logging

Always include error object for stack traces:

```typescript
// Good - error object included
logger.error({ error, context: 'sync' }, 'Sync failed');

// Bad - loses stack trace
logger.error('Sync failed: ' + error.message);
```

### Performance Logging

Include duration for async operations:

```typescript
const startTime = Date.now();
await expensiveOperation();
const duration = Date.now() - startTime;
logger.info({ duration, operation: 'sync' }, 'Operation completed');
```

## Output Formats

### Development (pino-pretty)

```text
[2024-01-15 10:30:45] INFO: Request completed
    requestId: "abc-123"
    duration: 45
    todoCount: 5
```

### Production (JSON)

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:45.123Z",
  "requestId": "abc-123",
  "duration": 45,
  "todoCount": 5,
  "msg": "Request completed"
}
```

## Conditional Logging

For expensive operations, check if level is enabled:

```typescript
import { isLogLevelEnabled } from '@/lib/logger';

if (isLogLevelEnabled('debug')) {
  logger.debug({ data: expensiveSerialize(largeObject) }, 'Debug info');
}
```

## ESLint Enforcement

The `no-console` rule is enforced at error level. Commits with `console.*` calls will be blocked.

**Exception**: Only `app/lib/logger.ts` is allowed to use console for browser fallback.

## Viewing Logs

### Local Development

Logs appear in terminal with color-coded pretty formatting.

### Vercel Production

1. Go to Vercel Dashboard > Project > Logs
2. Filter by log level or search by requestId
3. Use JSON fields for structured queries

## Migration from console.\*

Replace existing console calls:

```typescript
// Before
console.error('Failed to sync:', error);

// After
import { logger } from '@/lib/logger';
logger.error({ error }, 'Failed to sync');
```

## Best Practices

1. **Use structured context**: Pass objects first, message second
2. **Include request IDs**: Enable request tracing across logs
3. **Add timing**: Include duration for performance monitoring
4. **Keep messages concise**: Context goes in objects, not strings
5. **Log at boundaries**: API entry/exit, hook state changes
6. **Don't log sensitive data**: No passwords, tokens, or PII

## Summary

| Do                                    | Don't                                   |
| ------------------------------------- | --------------------------------------- |
| `logger.info({ id }, 'Created')`      | `console.log('Created', id)`            |
| `logger.error({ error }, 'Failed')`   | `console.error(error)`                  |
| `createChildLogger({ requestId })`    | Pass requestId to every log call        |
| Include duration for async operations | Log only success/failure without timing |
