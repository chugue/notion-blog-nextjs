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
    return <img {...props} alt="" />;
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

// Add TextEncoder and TextDecoder to the global scope for Jest
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock Next.js web APIs (Request, Response, Headers) for Jest environment
if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    constructor(input, init) {
      this.url = input instanceof URL ? input.toString() : String(input);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      // Add other properties as needed for your tests
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
      // Add other properties as needed for your tests
      this.json = async () => JSON.parse(this.body);
      this.text = async () => String(this.body);
    }
  };
}

// Mock NextRequest
if (typeof global.NextRequest === 'undefined') {
  global.NextRequest = class MockNextRequest {
    constructor(input, init) {
      this.url = input instanceof URL ? input.toString() : String(input);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      // Add nextUrl property
      const urlInstance = new URL(this.url);
      this.nextUrl = {
        searchParams: urlInstance.searchParams,
        // Add other properties of nextUrl if accessed
      };
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class MockHeaders {
    constructor(init) {
      this._map = new Map(init);
    }
    append(name, value) {
      this._map.set(name, value);
    }
    delete(name) {
      this._map.delete(name);
    }
    get(name) {
      return this._map.get(name);
    }
    has(name) {
      return this._map.has(name);
    }
    set(name, value) {
      this._map.set(name, value);
    }
    forEach(callback) {
      this._map.forEach(callback);
    }
  };
}

// Mock Next Response globally
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
      text: async () => JSON.stringify(body),
    })),
  },
  NextRequest: class MockNextRequestInternal {
    // Renamed to avoid global conflict
    constructor(input, init) {
      this.url = input instanceof URL ? input.toString() : String(input);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      const urlInstance = new URL(this.url);
      this.nextUrl = {
        searchParams: urlInstance.searchParams,
      };
    }
  },
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  unstable_cache: (fn, key, options) => {
    return fn;
  },
  revalidateTag: jest.fn(), // 👈 revalidateTag 모의 추가
}));

// Mock gsap
jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    timeline: jest.fn(() => ({
      to: jest.fn(),
      add: jest.fn(),
    })),
    registerPlugin: jest.fn(), // If needed
  },
  ScrollTrigger: {
    create: jest.fn(),
    // ... 필요한 ScrollTrigger 속성 및 메서드 모의
    // 예를 들어, .isTouch, .isMobile, .disable, .enable, .getAll, .refresh etc.
  },
  // ... 다른 gsap 하위 모듈도 필요한 경우 모의
}));
