# ADR-032: Error Monitoring Solution Selection

## Status

Accepted

## Context

The Todo App currently has no error monitoring infrastructure - only `console.error()` calls with no persistence or
alerting. As part of Epic #340 (Backend Protection), we need monitoring to:

- Track errors and exceptions in production
- Monitor rate limit events (when implemented)
- Understand system behavior and detect abuse
- Debug issues without requiring user reports

This ADR evaluates error monitoring solutions and recommends one for implementation.

## Decision Drivers

1. **Free tier limits** - Project is a learning/demo app with minimal traffic
2. **Next.js/Vercel integration** - Must work seamlessly with our stack
3. **Custom event tracking** - Need to track rate limit events, not just errors
4. **Setup complexity** - Prefer low-friction integration
5. **Privacy considerations** - Avoid excessive user data collection
6. **Cost at scale** - Understand pricing if project grows
7. **EU data residency** - Data must be stored in EU (Frankfurt) to match Vercel deployment region

## Options Considered

### Option 1: Sentry (Recommended)

**Overview**: Industry-standard error tracking with excellent Next.js integration.

**Free Tier (Developer Plan)**:

- 5,000 errors/month
- 10,000 performance transactions/month
- 500 session replays/month
- 1GB attachments
- 1 user

**Pros**:

- Official Next.js SDK with automatic instrumentation
- Vercel integration available
- Excellent error grouping and deduplication
- Custom events API for rate limit tracking
- Source maps support for readable stack traces
- Release tracking and deployment integration
- Active development and good documentation
- **EU data residency available** - Frankfurt data center matches our Vercel region

**Cons**:

- Free tier limits may require monitoring usage
- Some users report source map upload issues with Next.js
- Pricing changes announced for August 2025

**Cost at Scale**: Team plan starts at $29/month with higher limits

### Option 2: LogRocket

**Overview**: Session replay with error tracking, focused on understanding user behavior.

**Free Tier (Developer Plan)**:

- 1,000 sessions/month
- 30-day data retention
- Session replay
- Console logs and JS errors

**Pros**:

- Session replay helps debug user-reported issues
- Network request logging
- Good React/Next.js support

**Cons**:

- Session-based pricing (1,000/month is quite limited)
- Primary focus is session replay, not error tracking
- Team plan at $99/month is expensive for this project's scope
- More user data collection than needed (privacy concern)
- EU data residency requires Enterprise plan

**Cost at Scale**: Significantly higher than Sentry for similar functionality

### Option 3: Vercel Analytics + Monitoring

**Overview**: Native Vercel observability tools.

**Availability**: Pro and Enterprise plans only (not Hobby)

**Features**:

- Web Analytics (traffic, pages, referrers)
- Speed Insights (Core Web Vitals)
- Monitoring (logs, queries, error surfaces)
- 30-day retention (Pro) / 90-day (Enterprise)

**Pros**:

- Zero configuration with Vercel deployment
- Native integration with deployment pipeline
- Log Drains for external integrations
- OpenTelemetry support

**Cons**:

- **Not available on Hobby plan** (our current tier)
- Focused on infrastructure monitoring, less on application errors
- No custom event tracking for rate limits
- Would require upgrading Vercel plan ($20/month minimum)

**Cost**: $20/month (Pro plan) - not justified for error monitoring alone

### Option 4: Custom Upstash-Based Solution

**Overview**: Store error events in our existing Upstash Redis instance.

**Implementation Approach**:

```typescript
// Store errors in Redis list
await redis.lpush(
  'errors',
  JSON.stringify({
    timestamp: Date.now(),
    error: error.message,
    stack: error.stack,
    context: { url, userId },
  })
);

// Trim to last 1000 errors
await redis.ltrim('errors', 0, 999);
```

**Pros**:

- No additional service or account needed
- Full control over data format and retention
- No external data sharing (privacy)
- Works within existing Vercel KV quota

**Cons**:

- Significant development effort for dashboard/alerting
- No automatic error grouping or deduplication
- Consumes KV storage quota (100K requests/month on free tier)
- No source map integration
- Reinventing the wheel

**Cost**: Free (uses existing infrastructure) but high development cost

## Decision

**Implement Sentry** for error monitoring.

### Rationale

1. **Best free tier for our needs**: 5,000 errors/month is generous for a demo app
2. **Official Next.js SDK**: `@sentry/nextjs` provides automatic instrumentation
3. **Custom events**: Can track rate limit events via `Sentry.captureMessage()` or custom breadcrumbs
4. **Low setup complexity**: Single package, environment variables, done
5. **Industry standard**: Skills transfer to other projects
6. **Vercel integration**: Works well with our deployment pipeline
7. **EU data residency on free tier**: Frankfurt data center available at no extra cost

### Why Not Others

- **LogRocket**: Overkill for our needs, expensive, session-based limits too restrictive, EU requires Enterprise
- **Vercel Monitoring**: Requires paid plan upgrade, not focused on error tracking
- **Custom Upstash**: Development effort not justified when Sentry free tier is sufficient

## Implementation Approach

### Phase 1: Basic Setup (Issue #392)

1. Create Sentry organization with **EU region** (Frankfurt data center)
2. Install `@sentry/nextjs` package
3. Configure via `sentry.client.config.ts` and `sentry.server.config.ts`
4. Add `SENTRY_DSN` environment variable to Vercel (EU DSN: `*.ingest.de.sentry.io`)
5. Verify error capture in Sentry dashboard

### Phase 2: Custom Events (Issue #392)

1. Create utility for tracking rate limit events:

   ```typescript
   import * as Sentry from '@sentry/nextjs';

   export function trackRateLimitEvent(
     type: 'warning' | 'blocked',
     metadata: object
   ) {
     Sentry.captureMessage(`Rate limit ${type}`, {
       level: type === 'blocked' ? 'warning' : 'info',
       tags: { category: 'rate-limit' },
       extra: metadata,
     });
   }
   ```

2. Integrate with rate limiting middleware (Issue #393)

### Phase 3: Alerting (Future)

- Configure Sentry alerts for error spikes
- Set up Slack/email notifications if needed

## Cost Analysis

| Solution         | Monthly Cost | Annual Cost | EU Data Residency  | Notes                   |
| ---------------- | ------------ | ----------- | ------------------ | ----------------------- |
| Sentry (Free)    | $0           | $0          | ✅ Free            | 5K errors/month limit   |
| Sentry (Team)    | $29          | $348        | ✅ Free            | If free tier exceeded   |
| LogRocket (Free) | $0           | $0          | ❌ Enterprise only | 1K sessions/month limit |
| LogRocket (Team) | $99          | $1,188      | ❌ Enterprise only | Much higher than Sentry |
| Vercel Pro       | $20          | $240        | ✅ Follows region  | Required for Monitoring |
| Custom Upstash   | $0           | $0          | ✅ Our control     | High dev effort         |

**Recommendation**: Start with Sentry free tier. Monitor usage and upgrade only if limits are hit.

## Consequences

### Positive

- Production errors will be visible and trackable
- Rate limit events can be monitored for abuse detection
- Source maps provide readable stack traces
- Minimal ongoing maintenance

### Negative

- External service dependency
- Must keep DSN secret (environment variable)
- Need to monitor Sentry's pricing changes (August 2025)

### Neutral

- Adds one more third-party integration to manage
- Team will need Sentry account access for debugging

## References

- [Sentry Pricing](https://sentry.io/pricing/)
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Data Storage Location](https://docs.sentry.io/organization/data-storage-location/)
- [LogRocket Pricing](https://logrocket.com/pricing)
- [Vercel Observability](https://vercel.com/products/observability)
- [Upstash Redis with Next.js](https://upstash.com/docs/redis/tutorials/nextjs_with_redis)
- Epic #340: Backend Protection

## Related Issues

- #340 - Parent epic (Backend Protection)
- #391 - This research issue
- #392 - Implementation issue (depends on this ADR)
- #393 - Rate limiting (will use monitoring)
