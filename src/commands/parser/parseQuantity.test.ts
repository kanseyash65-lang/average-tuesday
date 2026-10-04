import { describe, expect, it } from 'vitest';
import { tokenize } from '../lexer/tokenize';
import { normalizeText } from '../normalizer/normalizeText';
import { parseQuantity } from './parseQuantity';

function quantityOf(spoken: string): number | undefined {
  return parseQuantity(tokenize(normalizeText(spoken).text));
}

describe('parseQuantity', () => {
  it('reads digits', () => {
    expect(quantityOf('spawn 500 chickens')).toBe(500);
  });

  it('reads simple number words', () => {
    expect(quantityOf('spawn five chickens')).toBe(5);
    expect(quantityOf('spawn fifty chickens')).toBe(50);
  });

  it('adds number words together', () => {
    expect(quantityOf('spawn twenty five chickens')).toBe(25);
    expect(quantityOf('spawn one hundred fifty chickens')).toBe(150);
  });

  it('skips "and" between number words', () => {
    expect(quantityOf('spawn one hundred and twenty chickens')).toBe(120);
  });

  it('multiplies by hundred, thousand and dozen', () => {
    expect(quantityOf('spawn three hundred chickens')).toBe(300);
    expect(quantityOf('spawn two thousand five hundred chickens')).toBe(2500);
    expect(quantityOf('spawn a dozen chickens')).toBe(12);
    expect(quantityOf('spawn two dozen chickens')).toBe(24);
    expect(quantityOf('spawn a hundred chickens')).toBe(100);
  });

  it('puts digit groups back together after the normalizer splits "1,000"', () => {
    expect(quantityOf('spawn 1,000 chickens')).toBe(1000);
    expect(quantityOf('spawn 12,500 chickens')).toBe(12500);
  });

  it('keeps absurd numbers finite', () => {
    expect(Number.isFinite(quantityOf(`spawn ${'9'.repeat(400)} chickens`))).toBe(true);
  });

  it('understands vague amounts', () => {
    expect(quantityOf('spawn many chickens')).toBe(20);
    expect(quantityOf('spawn a few chickens')).toBe(3);
  });

  it('prefers an exact number over a vague word', () => {
    expect(quantityOf('spawn a few more, say 7 chickens')).toBe(7);
  });

  it('returns undefined when no amount was said', () => {
    expect(quantityOf('spawn a chicken')).toBeUndefined();
    expect(quantityOf('spawn constructor')).toBeUndefined();
  });
});
