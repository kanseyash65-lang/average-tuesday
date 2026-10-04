import { describe, expect, it } from 'vitest';
import { describeDestroy } from './describeDestroy';

describe('describeDestroy', () => {
  it('uses the plural for several', () => {
    expect(describeDestroy('chicken', { destroyed: 3, skipped: 0 })).toBe('Deleted 3 chickens');
  });

  it('uses the singular for one', () => {
    expect(describeDestroy('chicken', { destroyed: 1, skipped: 0 })).toBe('Deleted 1 chicken');
  });

  it('mentions what could not be deleted', () => {
    expect(describeDestroy('everything', { destroyed: 3, skipped: 1 })).toBe(
      "Deleted 3 things (1 can't be deleted)",
    );
  });
});
