import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.restoreAllMocks();
});
