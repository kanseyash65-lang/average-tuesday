import { describe, expect, it } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits text into words', () => {
    expect(tokenize('turn the sun green')).toEqual(['turn', 'the', 'sun', 'green']);
  });

  it('returns no tokens for empty text', () => {
    expect(tokenize('')).toEqual([]);
  });
});
