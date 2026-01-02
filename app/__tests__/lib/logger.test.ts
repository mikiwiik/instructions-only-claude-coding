/**
 * Tests for the logger module
 *
 * @see ADR-036 for logging strategy
 */

import {
  logger,
  createChildLogger,
  generateRequestId,
  isLogLevelEnabled,
} from '../../lib/logger';

describe('logger module', () => {
  describe('logger instance', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have standard log methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should log without throwing', () => {
      expect(() => logger.info('test message')).not.toThrow();
      expect(() =>
        logger.info({ key: 'value' }, 'test message with context')
      ).not.toThrow();
    });
  });

  describe('createChildLogger', () => {
    it('should create a child logger with bindings', () => {
      const childLogger = createChildLogger({
        requestId: 'test-123',
        listId: 'list-456',
      });
      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });

    it('should log with inherited bindings', () => {
      const childLogger = createChildLogger({ component: 'TestComponent' });
      expect(() => childLogger.info('test message')).not.toThrow();
    });
  });

  describe('generateRequestId', () => {
    it('should generate a unique request ID', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2); // Should be unique
    });

    it('should generate UUID format when crypto.randomUUID is available', () => {
      const id = generateRequestId();
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[a-f0-9-]{36}$|^req-\d+-[a-z0-9]+$/);
    });
  });

  describe('isLogLevelEnabled', () => {
    it('should return boolean for log level check', () => {
      const result = isLogLevelEnabled('info');
      expect(typeof result).toBe('boolean');
    });

    it('should check various log levels', () => {
      expect(typeof isLogLevelEnabled('error')).toBe('boolean');
      expect(typeof isLogLevelEnabled('warn')).toBe('boolean');
      expect(typeof isLogLevelEnabled('debug')).toBe('boolean');
      expect(typeof isLogLevelEnabled('trace')).toBe('boolean');
    });
  });

  describe('log level configuration', () => {
    it('should have a valid log level', () => {
      const validLevels = [
        'fatal',
        'error',
        'warn',
        'info',
        'debug',
        'trace',
        'silent',
      ];
      expect(validLevels).toContain(logger.level);
    });
  });
});
