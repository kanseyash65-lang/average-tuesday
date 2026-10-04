import type { CommandValue, IParsedRequest, PropertyName } from '../Command';
import {
  COLOR_WORDS,
  DIRECTION_WORDS,
  lookup,
  SIZE_WORDS,
  VISIBILITY_WORDS,
} from '../vocabulary/vocabulary';
import { findTarget } from './findTarget';

export type ParseResult =
  | { readonly ok: true; readonly request: IParsedRequest }
  | { readonly ok: false; readonly reason: string };

interface IEffect {
  readonly property: PropertyName;
  readonly value: CommandValue;
}

function effectForWord(word: string): IEffect | undefined {
  const color = lookup(COLOR_WORDS, word);
  if (color !== undefined) {
    return { property: 'color', value: { kind: 'color', hex: color, label: word } };
  }
  const size = lookup(SIZE_WORDS, word);
  if (size !== undefined) {
    return { property: 'size', value: { kind: 'scale', ...size, label: word } };
  }
  const visibility = lookup(VISIBILITY_WORDS, word);
  if (visibility !== undefined) {
    return {
      property: 'visibility',
      value: { kind: 'boolean', value: visibility.visible, label: visibility.label },
    };
  }
  const direction = lookup(DIRECTION_WORDS, word);
  if (direction !== undefined) {
    return { property: 'position', value: { kind: 'offset', ...direction, label: word } };
  }
  return undefined;
}

function findEffect(tokens: readonly string[]): IEffect | undefined {
  for (const token of tokens) {
    const effect = effectForWord(token);
    if (effect !== undefined) return effect;
  }
  return undefined;
}

/**
 * Works out which thing the player means and what should change.
 * The verb is deliberately ignored: "turn", "make", "paint" and "change" all work.
 */
export function parseRequest(tokens: readonly string[]): ParseResult {
  const targetName = findTarget(tokens);
  if (targetName === undefined) {
    return { ok: false, reason: `I couldn't find that object. Try saying "the sun".` };
  }
  const effect = findEffect(tokens);
  if (effect === undefined) {
    return {
      ok: false,
      reason: `What should happen to the ${targetName}? Try "turn the ${targetName} green".`,
    };
  }
  return { ok: true, request: { targetName, property: effect.property, value: effect.value } };
}
