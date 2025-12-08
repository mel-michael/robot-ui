import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll, vi } from 'vitest';

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

afterAll(() => {
  cleanup();

  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
