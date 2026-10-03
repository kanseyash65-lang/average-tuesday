import { vi } from 'vitest';
import type { ILogger } from '../logger/ILogger';

/** A logger whose methods are spies, so tests can check what was logged. */
export function createFakeLogger(): ILogger {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };
} 