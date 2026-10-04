import {
  GROUP_MULTIPLIER_MINIMUM,
  MAX_SPOKEN_QUANTITY,
  MULTIPLIER_WORDS,
  NUMBER_WORDS,
  QUANTITY_HEURISTICS,
} from '../vocabulary/spawnVocabulary';
import { lookup } from '../vocabulary/vocabulary';

const DIGITS = /^\d+$/;
const FIRST_DIGIT_GROUP = /^\d{1,3}$/;
const LATER_DIGIT_GROUP = /^\d{3}$/;
const JOINING_WORD = 'and';

function isNumberWord(token: string): boolean {
  return lookup(NUMBER_WORDS, token) !== undefined || lookup(MULTIPLIER_WORDS, token) !== undefined;
}

/** "1,000" arrives from the normalizer as "1 000", so glue the groups back together. */
function readDigits(tokens: readonly string[], start: number): number {
  let text = tokens[start] ?? '';
  let next = start + 1;
  const canJoin = FIRST_DIGIT_GROUP.test(text);
  while (canJoin && LATER_DIGIT_GROUP.test(tokens[next] ?? '')) {
    text += tokens[next];
    next += 1;
  }
  return Math.min(Number.parseInt(text, 10), MAX_SPOKEN_QUANTITY);
}

/** Collects consecutive number words; "and" between them is skipped ("one hundred and twenty"). */
function readWordRun(tokens: readonly string[], start: number): string[] {
  const run: string[] = [];
  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index] ?? '';
    const joinsTwoNumbers =
      token === JOINING_WORD && run.length > 0 && isNumberWord(tokens[index + 1] ?? '');
    if (joinsTwoNumbers) continue;
    if (!isNumberWord(token)) break;
    run.push(token);
  }
  return run;
}

function evaluateWords(words: readonly string[]): number {
  let total = 0;
  let current = 0;
  for (const word of words) {
    const small = lookup(NUMBER_WORDS, word);
    if (small !== undefined) {
      current += small;
      continue;
    }
    const multiplier = lookup(MULTIPLIER_WORDS, word) ?? 1;
    if (multiplier >= GROUP_MULTIPLIER_MINIMUM) {
      total += (current || 1) * multiplier;
      current = 0;
    } else {
      current = (current || 1) * multiplier;
    }
  }
  return total + current;
}

function findVagueAmount(tokens: readonly string[]): number | undefined {
  for (const token of tokens) {
    const amount = lookup(QUANTITY_HEURISTICS, token);
    if (amount !== undefined) return amount;
  }
  return undefined;
}

/**
 * Reads how many the player asked for: digits ("500"), words ("fifty", "a dozen"),
 * or a vague amount ("many"). Returns undefined when no amount was said.
 */
export function parseQuantity(tokens: readonly string[]): number | undefined {
  for (const [index, token] of tokens.entries()) {
    if (DIGITS.test(token)) return readDigits(tokens, index);
    if (isNumberWord(token)) return evaluateWords(readWordRun(tokens, index));
  }
  return findVagueAmount(tokens);
}
