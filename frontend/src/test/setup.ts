import '@testing-library/jest-dom';

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Make vi available globally
import { vi } from 'vitest';
global.vi = vi;

// Set up environment variables for Convex integration tests
process.env.VITE_CONVEX_URL = 'https://glorious-mule-933.convex.cloud';