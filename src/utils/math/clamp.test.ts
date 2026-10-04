import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('leaves values inside the range alone', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('raises values below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('lowers values above the maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});
