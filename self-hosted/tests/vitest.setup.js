import { vi } from "vitest";
import "@testing-library/jest-dom";

// ── localStorage mock (Node test runs) ───────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// ── Mock browser APIs not available in jsdom ─────────────────────────────────

// Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
});

// URL.createObjectURL (used by export buttons)
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// HTMLAnchorElement.click (used by download buttons)
HTMLAnchorElement.prototype.click = vi.fn();

// ── Mock fetch globally — individual tests override as needed ─────────────────
global.fetch = vi.fn();

// ── Suppress console.error for expected React warnings in tests ───────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") || args[0].includes("ReactDOM.render"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// ── Reset all mocks between tests ─────────────────────────────────────────────
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
