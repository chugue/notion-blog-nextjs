// Mock crypto.subtle for environments where it might not be available (e.g., Jest JSDOM)
if (typeof global.crypto === 'undefined') {
  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: jest.fn(async (algorithm, data) => {
          if (algorithm !== 'SHA-256') {
            throw new Error('Only SHA-256 is supported in mock');
          }
          // Simulate a SHA-256 hash for testing purposes
          const text = new TextDecoder().decode(data);
          const hash = Array.from(text)
            .map((char) => char.charCodeAt(0).toString(16))
            .join('');
          return Promise.resolve(new TextEncoder().encode(hash).buffer);
        }),
      },
      getRandomValues: jest.fn((array) => array),
      randomUUID: jest.fn(() => 'mock-uuid'),
    },
  });
}

import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  },
}));

// Global test utilities
global.fetch = jest.fn();

// Mock window.matchMedia
if (typeof window !== 'undefined') {
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
}

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
