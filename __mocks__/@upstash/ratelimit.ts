/* eslint-env jest */
/**
 * Manual mock for @upstash/ratelimit
 *
 * Jest loads this automatically when tests import @upstash/ratelimit
 * Provides controllable rate limit behavior for testing.
 */

type LimitResponse = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const mockLimit = jest.fn<Promise<LimitResponse>, [string]>(() =>
  Promise.resolve({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 30000,
  })
);

interface MockRatelimitClass {
  (): { limit: typeof mockLimit };
  slidingWindow: jest.Mock;
  fixedWindow: jest.Mock;
  tokenBucket: jest.Mock;
}

const MockRatelimit = jest.fn(() => ({
  limit: mockLimit,
})) as unknown as MockRatelimitClass;

// Static methods that return limiter configs
MockRatelimit.slidingWindow = jest.fn(
  (tokens: number, window: string) => `slidingWindow:${tokens}:${window}`
);
MockRatelimit.fixedWindow = jest.fn(
  (tokens: number, window: string) => `fixedWindow:${tokens}:${window}`
);
MockRatelimit.tokenBucket = jest.fn(
  (tokens: number, interval: string, maxTokens: number) =>
    `tokenBucket:${tokens}:${interval}:${maxTokens}`
);

// Export for type compatibility
export const Ratelimit = MockRatelimit;

// Export mock functions for test control
export const __mockLimit = mockLimit;
export const __mockRatelimit = MockRatelimit;

/**
 * Helper to simulate rate limit exceeded
 */
export function __setRateLimited(retryAfterMs = 30000): void {
  mockLimit.mockResolvedValue({
    success: false,
    limit: 30,
    remaining: 0,
    reset: Date.now() + retryAfterMs,
  });
}

/**
 * Helper to reset to normal (not rate limited)
 */
export function __resetRateLimit(): void {
  mockLimit.mockResolvedValue({
    success: true,
    limit: 30,
    remaining: 29,
    reset: Date.now() + 30000,
  });
}

/**
 * Helper to simulate rate limit error
 */
export function __setRateLimitError(error: Error): void {
  mockLimit.mockRejectedValue(error);
}
