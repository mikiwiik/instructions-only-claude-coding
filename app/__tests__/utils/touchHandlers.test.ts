import { combineTouchHandlers } from '../../utils/touchHandlers';

describe('combineTouchHandlers', () => {
  describe('onTouchStart', () => {
    it('should combine multiple onTouchStart handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchStart: handler1 },
        { onTouchStart: handler2 },
        { onTouchStart: handler3 }
      );

      const mockEvent = {} as React.TouchEvent;
      combined.onTouchStart?.(mockEvent);

      expect(handler1).toHaveBeenCalledWith(mockEvent);
      expect(handler2).toHaveBeenCalledWith(mockEvent);
      expect(handler3).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle undefined onTouchStart handlers', () => {
      const handler1 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchStart: handler1 },
        {},
        { onTouchStart: undefined }
      );

      const mockEvent = {} as React.TouchEvent;
      expect(() => combined.onTouchStart?.(mockEvent)).not.toThrow();
      expect(handler1).toHaveBeenCalledWith(mockEvent);
    });

    it('should create noop onTouchStart when no handlers provided', () => {
      const combined = combineTouchHandlers({}, {});

      const mockEvent = {} as React.TouchEvent;
      expect(() => combined.onTouchStart?.(mockEvent)).not.toThrow();
    });
  });

  describe('onTouchMove', () => {
    it('should combine multiple onTouchMove handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchMove: handler1 },
        { onTouchMove: handler2 }
      );

      const mockEvent = {} as React.TouchEvent;
      combined.onTouchMove?.(mockEvent);

      expect(handler1).toHaveBeenCalledWith(mockEvent);
      expect(handler2).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle undefined onTouchMove handlers', () => {
      const handler1 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchMove: handler1 },
        { onTouchMove: undefined }
      );

      const mockEvent = {} as React.TouchEvent;
      expect(() => combined.onTouchMove?.(mockEvent)).not.toThrow();
      expect(handler1).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onTouchEnd', () => {
    it('should combine multiple onTouchEnd handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchEnd: handler1 },
        { onTouchEnd: handler2 }
      );

      combined.onTouchEnd?.();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle undefined onTouchEnd handlers', () => {
      const handler1 = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchEnd: handler1 },
        { onTouchEnd: undefined }
      );

      expect(() => combined.onTouchEnd?.()).not.toThrow();
      expect(handler1).toHaveBeenCalled();
    });
  });

  describe('combined handlers', () => {
    it('should combine all touch event types', () => {
      const startHandler1 = jest.fn();
      const startHandler2 = jest.fn();
      const moveHandler1 = jest.fn();
      const moveHandler2 = jest.fn();
      const endHandler1 = jest.fn();
      const endHandler2 = jest.fn();

      const combined = combineTouchHandlers(
        {
          onTouchStart: startHandler1,
          onTouchMove: moveHandler1,
          onTouchEnd: endHandler1,
        },
        {
          onTouchStart: startHandler2,
          onTouchMove: moveHandler2,
          onTouchEnd: endHandler2,
        }
      );

      const mockEvent = {} as React.TouchEvent;

      combined.onTouchStart?.(mockEvent);
      combined.onTouchMove?.(mockEvent);
      combined.onTouchEnd?.();

      expect(startHandler1).toHaveBeenCalledWith(mockEvent);
      expect(startHandler2).toHaveBeenCalledWith(mockEvent);
      expect(moveHandler1).toHaveBeenCalledWith(mockEvent);
      expect(moveHandler2).toHaveBeenCalledWith(mockEvent);
      expect(endHandler1).toHaveBeenCalled();
      expect(endHandler2).toHaveBeenCalled();
    });

    it('should handle mixed handler definitions', () => {
      const startHandler = jest.fn();
      const endHandler = jest.fn();

      const combined = combineTouchHandlers(
        { onTouchStart: startHandler },
        {},
        { onTouchEnd: endHandler }
      );

      const mockEvent = {} as React.TouchEvent;

      expect(() => {
        combined.onTouchStart?.(mockEvent);
        combined.onTouchMove?.(mockEvent);
        combined.onTouchEnd?.();
      }).not.toThrow();

      expect(startHandler).toHaveBeenCalledWith(mockEvent);
      expect(endHandler).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle no handlers provided', () => {
      const combined = combineTouchHandlers();

      const mockEvent = {} as React.TouchEvent;

      expect(() => {
        combined.onTouchStart?.(mockEvent);
        combined.onTouchMove?.(mockEvent);
        combined.onTouchEnd?.();
      }).not.toThrow();
    });

    it('should handle single handler set', () => {
      const handlers = {
        onTouchStart: jest.fn(),
        onTouchMove: jest.fn(),
        onTouchEnd: jest.fn(),
      };

      const combined = combineTouchHandlers(handlers);

      const mockEvent = {} as React.TouchEvent;

      combined.onTouchStart?.(mockEvent);
      combined.onTouchMove?.(mockEvent);
      combined.onTouchEnd?.();

      expect(handlers.onTouchStart).toHaveBeenCalledWith(mockEvent);
      expect(handlers.onTouchMove).toHaveBeenCalledWith(mockEvent);
      expect(handlers.onTouchEnd).toHaveBeenCalled();
    });

    it('should preserve handler execution order', () => {
      const executionOrder: number[] = [];

      const handlers1 = {
        onTouchStart: () => executionOrder.push(1),
      };

      const handlers2 = {
        onTouchStart: () => executionOrder.push(2),
      };

      const handlers3 = {
        onTouchStart: () => executionOrder.push(3),
      };

      const combined = combineTouchHandlers(handlers1, handlers2, handlers3);

      combined.onTouchStart?.({} as React.TouchEvent);

      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });
});
