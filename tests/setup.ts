import { JSDOM } from 'jsdom';

// Create a global DOM if one doesn't exist (used by @testing-library/react)
if (typeof globalThis.window === 'undefined' || typeof globalThis.document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  // @ts-ignore - assign JSDOM globals for test environment
  globalThis.window = dom.window;
  // @ts-ignore - assign JSDOM globals for test environment
  globalThis.document = dom.window.document;
  // Minimal globals expected by various libs
  // @ts-ignore - assign JSDOM globals for test environment
  globalThis.HTMLElement = dom.window.HTMLElement;
  // Provide minimal DOM classes & Node for libs expecting them
  // @ts-ignore
  globalThis.Element = dom.window.Element || class Element {};
  // @ts-ignore - assign SVGElement mock for test environment
  globalThis.SVGElement = dom.window.SVGElement || class SVGElement {};
  // Minimal fetch mock so components calling fetch('/api/...') don't error on invalid URL
  // Accept relative URLs and return a simple success response, or delegate to original fetch for absolute URLs
  // @ts-ignore - capture original global fetch
  const originalFetch = (globalThis as any).fetch;
  const mockFetch = (input: any, init?: any) => {
    try {
      if (typeof input === 'string' && input.startsWith('/')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      }
      if (originalFetch && typeof originalFetch === 'function') return originalFetch(input, init);
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    } catch (_err) {
      void _err;
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    }
  };
  // ensure both window.fetch and global fetch are set and protected from being overwritten
  try {
    Object.defineProperty(globalThis, 'fetch', {
      value: mockFetch,
      writable: false,
      configurable: false,
    });
  } catch (_err) {
    // fallback if property cannot be defined
    void _err;
    // @ts-ignore
    globalThis.fetch = mockFetch;
  }
  try {
    // @ts-ignore
    Object.defineProperty(globalThis.window, 'fetch', {
      value: mockFetch,
      writable: false,
      configurable: false,
    });
  } catch (_err) {
    void _err;
    // @ts-ignore
    globalThis.window.fetch = mockFetch;
  }
  // Provide basic Request/Response constructors if not present
  // @ts-ignore
  globalThis.Request = globalThis.Request || dom.window.Request;
  // @ts-ignore
  globalThis.Response = globalThis.Response || dom.window.Response;
  // Needed for addEventListener in some components
  // @ts-ignore - assign requestAnimationFrame polyfill for test environment
  globalThis.window.requestAnimationFrame = function (cb: any) {
    return setTimeout(cb, 0);
  };

  // Cleanup DOM between tests to avoid leaking elements across renders
  // Note: test runners expose beforeEach/afterEach globally; guard in case they are not available
  try {
    // @ts-ignore - register beforeEach in test environment if available
    if (typeof (globalThis as any).beforeEach === 'function') {
      // @ts-ignore
      beforeEach(() => {
        document.body.innerHTML = '';
      });
    }
    // @ts-ignore - register afterEach in test environment if available
    if (typeof (globalThis as any).afterEach === 'function') {
      // @ts-ignore
      afterEach(() => {
        document.body.innerHTML = '';
      });
    }
  } catch (_err) {
    // If the test framework doesn't expose lifecycle hooks in this environment, skip cleanup.
    void _err;
  }
}
