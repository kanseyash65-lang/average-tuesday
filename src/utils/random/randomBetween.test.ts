import { describe, expect, it } from 'vitest';
import { randomBetween } from './randomBetween';

describe('randomBetween', () => {
  it('returns the minimum when the source returns 0', () => {
    expect(randomBetween(10, 20, () => 0)).toBe(10);
  });

  it('scales the source across the range', () => {
    expect(randomBetween(10, 20, () => 0.5)).toBe(15);
  });

  it('stays below the maximum for the largest possible source value', () => {
    expect(randomBetween(10, 20, () => 0.999999)).toBeLessThanOrEqual(20);
  });
});
