import '@testing-library/jest-dom';
import React from 'react';

// Mock localStorage with actual storage functionality
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock remark plugins for markdown processing
jest.mock('remark-gfm', () => {
  return jest.fn(() => (tree) => tree);
});

jest.mock('remark-breaks', () => {
  return jest.fn(() => (tree) => tree);
});

// Mock react-markdown for testing
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return React.createElement(
      'div',
      { 'data-testid': 'markdown-content' },
      children
    );
  };
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});
