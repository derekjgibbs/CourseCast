import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// This is important so that we don't reuse the same rendering context for each test.
beforeEach(cleanup);

// Fix for Radix UI components in JSDOM
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn(() => "blob:mock-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});
