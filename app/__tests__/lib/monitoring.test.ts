/**
 * Tests for the monitoring utility module.
 *
 * These tests verify that error tracking and rate limit events
 * are correctly captured and sent to Sentry in production,
 * while being suppressed in development/test environments.
 */

import * as Sentry from '@sentry/nextjs';
import {
  trackRateLimitEvent,
  captureError,
  setUserContext,
  type RateLimitMetadata,
} from '../../lib/monitoring';
import { logger } from '../../lib/logger';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Helper to set environment variables safely for testing
function setEnv(env: Record<string, string | undefined>) {
  process.env = { ...process.env, ...env } as NodeJS.ProcessEnv;
}

describe('monitoring', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('trackRateLimitEvent', () => {
    describe('in production', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'production', USE_IN_MEMORY_STORE: undefined });
      });

      it('should capture warning events with info level', () => {
        const metadata: RateLimitMetadata = {
          listId: 'test-list',
          remaining: 5,
        };

        trackRateLimitEvent('warning', metadata);

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
          'Rate limit warning',
          expect.objectContaining({
            level: 'info',
            tags: expect.objectContaining({
              category: 'rate-limit',
              'rate-limit.type': 'warning',
            }),
          })
        );
      });

      it('should capture blocked events with warning level', () => {
        const metadata: RateLimitMetadata = {
          listId: 'test-list',
          endpoint: '/api/shared/test-list/sync',
        };

        trackRateLimitEvent('blocked', metadata);

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
          'Rate limit blocked',
          expect.objectContaining({
            level: 'warning',
            tags: expect.objectContaining({
              category: 'rate-limit',
              'rate-limit.type': 'blocked',
              'rate-limit.endpoint': '/api/shared/test-list/sync',
            }),
          })
        );
      });

      it('should include all metadata in extra field', () => {
        const metadata: RateLimitMetadata = {
          listId: 'abc123',
          clientIp: '192.168.x.x',
          remaining: 3,
          resetIn: 60000,
          endpoint: '/api/test',
        };

        trackRateLimitEvent('warning', metadata);

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            extra: expect.objectContaining({
              listId: 'abc123',
              clientIp: '192.168.x.x',
              remaining: 3,
              resetIn: 60000,
              endpoint: '/api/test',
              timestamp: expect.any(String),
            }),
          })
        );
      });

      it('should not include endpoint tag when not provided', () => {
        trackRateLimitEvent('warning', { listId: 'test' });

        const callArgs = (Sentry.captureMessage as jest.Mock).mock.calls[0][1];
        expect(callArgs.tags['rate-limit.endpoint']).toBeUndefined();
      });
    });

    describe('in development', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'development' });
      });

      it('should not call Sentry', () => {
        trackRateLimitEvent('blocked', { listId: 'test' });

        expect(Sentry.captureMessage).not.toHaveBeenCalled();
      });

      it('should log with logger', () => {
        const metadata = { listId: 'test', remaining: 5 };
        trackRateLimitEvent('warning', metadata);

        expect(logger.info).toHaveBeenCalledWith(
          { type: 'warning', ...metadata },
          'Rate limit warning'
        );
      });
    });

    describe('in test environment', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'test' });
      });

      it('should not call Sentry', () => {
        trackRateLimitEvent('blocked', { listId: 'test' });

        expect(Sentry.captureMessage).not.toHaveBeenCalled();
      });

      it('should not log with logger', () => {
        trackRateLimitEvent('warning', { listId: 'test' });

        expect(logger.info).not.toHaveBeenCalled();
      });
    });

    describe('with USE_IN_MEMORY_STORE', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'production', USE_IN_MEMORY_STORE: 'true' });
      });

      it('should not call Sentry even in production', () => {
        trackRateLimitEvent('blocked', { listId: 'test' });

        expect(Sentry.captureMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('captureError', () => {
    describe('in production', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'production', USE_IN_MEMORY_STORE: undefined });
      });

      it('should capture exception with context', () => {
        const error = new Error('Test error');
        const context = { listId: 'abc123', operation: 'sync' };

        captureError(error, context);

        expect(Sentry.captureException).toHaveBeenCalledWith(
          error,
          expect.objectContaining({
            extra: expect.objectContaining({
              listId: 'abc123',
              operation: 'sync',
              timestamp: expect.any(String),
            }),
          })
        );
      });

      it('should log with logger', () => {
        const error = new Error('Test error');
        const context = { key: 'value' };

        captureError(error, context);

        expect(logger.error).toHaveBeenCalledWith(
          { error, ...context },
          '[App Error]'
        );
      });

      it('should work without context', () => {
        const error = new Error('No context');

        captureError(error);

        expect(Sentry.captureException).toHaveBeenCalledWith(
          error,
          expect.objectContaining({
            extra: expect.objectContaining({
              timestamp: expect.any(String),
            }),
          })
        );
      });
    });

    describe('in development', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'development' });
      });

      it('should not call Sentry', () => {
        captureError(new Error('Test'), { key: 'value' });

        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it('should still log with logger', () => {
        const error = new Error('Dev error');
        captureError(error);

        expect(logger.error).toHaveBeenCalledWith({ error }, '[App Error]');
      });
    });

    describe('in test environment', () => {
      beforeEach(() => {
        setEnv({ NODE_ENV: 'test' });
      });

      it('should not call Sentry', () => {
        captureError(new Error('Test error'));

        expect(Sentry.captureException).not.toHaveBeenCalled();
      });
    });
  });

  describe('setUserContext', () => {
    it('should set user when ID provided', () => {
      setUserContext('user-123');

      expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'user-123' });
    });

    it('should clear user when null provided', () => {
      setUserContext(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });
});
