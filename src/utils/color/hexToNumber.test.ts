import { describe, expect, it } from 'vitest';
import { hexToNumber } from './hexToNumber';

describe('hexToNumber', () => {
  it('converts a hex color to a number', () => {
    expect(hexToNumber('#ffd54a')).toBe(0xffd54a);
    expect(hexToNumber('#00ff00')).toBe(0x00ff00);
  });

  it('accepts upper case digits', () => {
    expect(hexToNumber('#FFD54A')).toBe(0xffd54a);
  });

  it('keeps black as 0 instead of treating it as missing', () => {
    expect(hexToNumber('#000000')).toBe(0);
  });

  it('rejects short hex colors', () => {
    expect(hexToNumber('#fff')).toBeUndefined();
  });

  it('rejects color names', () => {
    expect(hexToNumber('green')).toBeUndefined();
  });

  it('rejects an empty string', () => {
    expect(hexToNumber('')).toBeUndefined();
  });
});
