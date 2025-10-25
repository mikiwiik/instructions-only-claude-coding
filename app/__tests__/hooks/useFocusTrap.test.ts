import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button2 = document.createElement('button');
    button3 = document.createElement('button');

    button1.textContent = 'Button 1';
    button2.textContent = 'Button 2';
    button3.textContent = 'Button 3';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('getFocusableElements', () => {
    it('should find all focusable elements in container', () => {
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toHaveLength(3);
      expect(elements[0]).toBe(button1);
      expect(elements[1]).toBe(button2);
      expect(elements[2]).toBe(button3);
    });

    it('should exclude disabled buttons', () => {
      button2.disabled = true;
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toHaveLength(2);
      expect(elements[0]).toBe(button1);
      expect(elements[1]).toBe(button3);
    });

    it('should return empty array if container is null', () => {
      const containerRef = { current: null } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toEqual([]);
    });

    it('should find input elements', () => {
      const input = document.createElement('input');
      container.appendChild(input);

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toHaveLength(4);
      expect(elements[3]).toBe(input);
    });

    it('should find elements with tabindex', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      container.appendChild(div);

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toHaveLength(4);
      expect(elements[3]).toBe(div);
    });

    it('should exclude elements with tabindex -1', () => {
      const div = document.createElement('div');
      div.tabIndex = -1;
      container.appendChild(div);

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const elements = result.current.getFocusableElements();

      expect(elements).toHaveLength(3); // Only the 3 buttons
    });
  });

  describe('handleTabKey', () => {
    it('should move focus forward on Tab', () => {
      button1.focus();
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(button2);
    });

    it('should move focus backward on Shift+Tab', () => {
      button2.focus();
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(button1);
    });

    it('should wrap to first element when tabbing from last', () => {
      button3.focus();
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      expect(document.activeElement).toBe(button1);
    });

    it('should wrap to last element when shift-tabbing from first', () => {
      button1.focus();
      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      expect(document.activeElement).toBe(button3);
    });

    it('should handle no focusable elements gracefully', () => {
      // Remove all buttons
      container.innerHTML = '';

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      expect(() => result.current.handleTabKey(mockEvent)).not.toThrow();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle single focusable element', () => {
      container.innerHTML = '';
      container.appendChild(button1);
      button1.focus();

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      expect(document.activeElement).toBe(button1);
    });

    it('should handle focus on element outside container', () => {
      const outsideButton = document.createElement('button');
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      const containerRef = { current: container } as RefObject<HTMLElement>;
      const { result } = renderHook(() => useFocusTrap(containerRef));

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      } as unknown as KeyboardEvent;

      result.current.handleTabKey(mockEvent);

      // Should focus first element when current focus is outside
      expect(document.activeElement).toBe(button1);

      document.body.removeChild(outsideButton);
    });
  });
});
