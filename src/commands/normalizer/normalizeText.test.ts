import { describe, expect, it } from 'vitest';
import { normalizeText } from './normalizeText';

describe('normalizeText', () => {
  it('lower-cases and strips punctuation', () => {
    expect(normalizeText('Turn the Sun GREEN!').text).toBe('turn the sun green');
  });

  it('collapses extra spaces', () => {
    expect(normalizeText('  make   the sun   bigger ').text).toBe('make the sun bigger');
  });

  it('fixes British spelling without lowering confidence', () => {
    const result = normalizeText('Change the colour of the sun');
    expect(result.text).toBe('change the color of the sun');
    expect(result.correctionsApplied).toBe(0);
  });

  it('fixes mishearings Wispr Flow really produced', () => {
    expect(normalizeText('Turn this on green.')).toEqual({
      text: 'turn the sun green',
      correctionsApplied: 1,
    });
    expect(normalizeText('Sun do sun green').text).toBe('turn the sun green');
  });

  it('only matches whole words', () => {
    expect(normalizeText('the thisonly sunny').text).toBe('the thisonly sunny');
  });
});
