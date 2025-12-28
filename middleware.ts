/**
 * Next.js Edge Middleware for API rate limiting.
 *
 * Uses Upstash Redis for distributed rate limiting across all edge locations.
 * Rate limits are applied to all /api/* routes.
 *
 * @see ADR-033 for the rate limiting strategy decision
 * @see docs/setup/upstash-setup.md for configuration
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { RATE_LIMIT_CONFIG } from './app/lib/config';

/**
 * Rate limiter instance.
 *
 * Configuration values from RATE_LIMIT_CONFIG:
 * - Sliding window algorithm for smooth rate limiting
 * - MAX_REQUESTS per WINDOW_DURATION per IP
 * - Analytics enabled for Upstash dashboard visibility
 *
 * Note: In test environments (USE_IN_MEMORY_STORE=true), this will fail
 * to initialize since no Redis credentials exist. The middleware handles
 * this gracefully by skipping rate limiting.
 */
let ratelimit: Ratelimit | null = null;

// Only initialize rate limiter if Redis credentials are available
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIG.MAX_REQUESTS,
      RATE_LIMIT_CONFIG.WINDOW_DURATION
    ),
    analytics: true,
    prefix: RATE_LIMIT_CONFIG.KEY_PREFIX,
  });
}

/**
 * Get client IP address from request.
 * Checks various headers in order of preference.
 */
function getClientIp(request: NextRequest): string {
  // Vercel provides the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  // Vercel-specific header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Mask IP address for privacy in logs.
 * Shows only first two octets for IPv4.
 */
function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  // IPv6 or other formats - just show first segment
  return ip.split(':')[0] + ':...:';
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting if not configured (local dev without Redis)
  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    // Create response (either continue or 429)
    if (!success) {
      // Log rate limit event to Sentry
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage('Rate limit blocked', {
          level: 'warning',
          tags: {
            category: 'rate-limit',
            'rate-limit.type': 'blocked',
            'rate-limit.endpoint': request.nextUrl.pathname,
          },
          extra: {
            clientIp: maskIp(ip),
            endpoint: request.nextUrl.pathname,
            limit,
            remaining: 0,
            resetAt: new Date(reset).toISOString(),
          },
        });
      }

      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Continue with rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
    return response;
  } catch (error) {
    // Log error but don't block requests if rate limiting fails
    // eslint-disable-next-line no-console
    console.error('[Rate Limit] Error checking rate limit:', error);

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: { category: 'rate-limit', type: 'error' },
        extra: { endpoint: request.nextUrl.pathname },
      });
    }

    // Fail open - allow request through if rate limiting fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/api/:path*',
};
