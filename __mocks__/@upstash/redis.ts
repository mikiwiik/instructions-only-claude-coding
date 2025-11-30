/* eslint-env jest */
/**
 * Manual mock for @upstash/redis
 *
 * Jest loads this automatically when tests import @upstash/redis
 */

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();

const MockRedis = jest.fn(() => ({
  get: mockGet,
  set: mockSet,
  del: mockDel,
}));

// Export for type compatibility and access
export const Redis = MockRedis;
export const __mockGet = mockGet;
export const __mockSet = mockSet;
export const __mockDel = mockDel;
