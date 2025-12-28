# ADR-033: Rate Limiting Strategy with Upstash

## Status

Accepted

## Context

As part of Epic #340 (Backend Protection), we need server-side rate limiting to protect our API endpoints from abuse.
The client-side click throttling (#391) prevents accidental rapid clicks, but malicious actors can bypass client-side
controls. With error monitoring now in place (#392), we can implement rate limiting with visibility into its
effectiveness.

### Key Challenges

1. **Stateless Edge Functions**: Vercel Edge functions are stateless - in-memory counters don't work across instances
2. **Distributed State**: Rate limiting requires shared state accessible from any edge location
3. **Low Latency**: Rate limit checks must be fast to avoid adding significant request overhead
4. **Free Tier Constraints**: Solution must work within our Vercel Hobby plan and Upstash free tier

## Decision

**Use `@upstash/ratelimit` with our existing Upstash Redis instance for distributed rate limiting.**

### Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Request │────▶│  Vercel Edge    │────▶│  Upstash Redis  │
│                 │     │  (middleware.ts) │     │  (rate state)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                       │
                              │  ① Check rate limit   │
                              │─────────────────────▶│
                              │  ② success/blocked   │
                              │◀─────────────────────│
                              │                       │
                        ┌─────┴─────┐                │
                        │           │                │
                   success     blocked               │
                        │           │                │
                        ▼           ▼                │
                   Continue    Return 429            │
                   to API      + Sentry log          │
```

### Configuration

| Parameter  | Value          | Rationale                                |
| ---------- | -------------- | ---------------------------------------- |
| Algorithm  | Sliding window | Smoother rate limiting than fixed window |
| Limit      | 30 requests    | Generous for legitimate use              |
| Window     | 30 seconds     | Balances protection vs. user experience  |
| Identifier | Client IP      | Simple, no auth required                 |
| Scope      | `/api/*`       | Protects all API endpoints               |

## Alternatives Considered

### Alternative 1: Vercel Firewall / WAF

**Description**: Use Vercel's built-in Web Application Firewall for rate limiting.

**Rejected because**:

- Requires Vercel Pro plan ($20/month minimum)
- We're on Hobby plan - not available
- Would require plan upgrade just for rate limiting

### Alternative 2: In-Memory Rate Limiting

**Description**: Use in-memory Map or Set to track request counts.

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();
```

**Rejected because**:

- Vercel Edge functions are stateless
- Each edge instance has its own memory
- Rate limits wouldn't be shared across instances
- Users could exceed limits by hitting different edge locations

### Alternative 3: Self-Hosted Redis (e.g., Railway, Render)

**Description**: Deploy and manage our own Redis instance.

**Rejected because**:

- Significant operational overhead (backups, updates, monitoring)
- Not globally distributed - latency from some edge locations
- Free tiers often have limited connections or storage
- Upstash already provides managed, serverless Redis

### Alternative 4: Database-Based Rate Limiting

**Description**: Use Vercel KV (our existing Redis) with custom rate limiting logic.

```typescript
const key = `ratelimit:${ip}:${window}`;
const count = await redis.incr(key);
await redis.expire(key, 30);
```

**Rejected because**:

- Reinvents the wheel - Upstash already provides `@upstash/ratelimit`
- Less efficient than sliding window algorithm
- No built-in analytics or debugging
- Custom implementation is error-prone

## Algorithm Choice: Sliding Window

### Why Not Fixed Window?

Fixed window rate limiting has a burst problem at window boundaries:

```text
Window 1         │ Window 2
─────────────────│─────────────────
     28 requests │ 30 requests
        ┌────────┼────────┐
        │  58 requests in │
        │  ~30 seconds!   │
        └────────┴────────┘
```

### Why Sliding Window?

Sliding window provides smoother rate limiting:

```text
         ◄────── 30 second window ──────►
─────────────────────────────────────────
         │ Count all requests in this │
         │ rolling window             │
         └────────────────────────────┘
```

### Why Not Token Bucket?

- Token bucket allows bursting up to bucket size
- More complex to configure (bucket size, refill rate)
- Sliding window is simpler and sufficient for our use case

## Implementation Details

### Middleware Structure

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '30 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip =
    request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    // Log to Sentry for monitoring
    return new NextResponse('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Client-Side 429 Handling

```typescript
// In useTodoSync.ts
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Show user-friendly message, schedule retry
}
```

## Consequences

### Positive

- **No additional infrastructure**: Uses existing Upstash Redis instance
- **Low latency**: Upstash edge locations are globally distributed
- **Proven library**: `@upstash/ratelimit` is battle-tested
- **Analytics**: Built-in rate limit analytics in Upstash dashboard
- **Monitoring integration**: Rate limit events visible in Sentry

### Negative

- **Upstash dependency**: Rate limiting tied to Upstash availability
- **Redis quota usage**: Counts against Upstash free tier (10K commands/day)
- **IP-based limitations**: Shared IPs (corporate NAT) may affect multiple users

### Neutral

- Adds ~50-100ms to each API request for rate limit check
- Requires handling 429 responses in client code
- Rate limit headers add small overhead to responses

## Cost Analysis

| Component            | Free Tier Limit  | Expected Usage | Cost |
| -------------------- | ---------------- | -------------- | ---- |
| Upstash Redis        | 10K commands/day | ~1-2K/day      | $0   |
| `@upstash/ratelimit` | N/A (library)    | N/A            | $0   |
| Sentry logging       | 5K events/month  | ~100/month     | $0   |

**Total additional cost**: $0 (within free tier limits)

## References

- [Upstash Rate Limit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [Rate Limiting Algorithms](https://upstash.com/blog/ratelimit-algorithms)
- [ADR-032: Error Monitoring Solution](./032-error-monitoring-solution.md)
- Epic #340: Backend Protection
- Issue #393: Server-side rate limiting (this implementation)
