import type { IDestroyRequest } from '../Command';
import { DESTROY_EXAMPLE, DESTROY_VERBS } from '../vocabulary/destroyVocabulary';
import { findTarget } from './findTarget';

export type DestroyParseResult =
  | { readonly ok: true; readonly request: IDestroyRequest }
  | { readonly ok: false; readonly reason: string };

/** True when any word means "remove from the world". */
export function hasDestroyVerb(tokens: readonly string[]): boolean {
  return tokens.some((token) => DESTROY_VERBS.has(token));
}

/** Works out what to delete. Only call this when hasDestroyVerb is true. */
export function parseDestroy(tokens: readonly string[]): DestroyParseResult {
  const targetName = findTarget(tokens);
  if (targetName === undefined) {
    return { ok: false, reason: `I couldn't find that object. Try "${DESTROY_EXAMPLE}".` };
  }
  return { ok: true, request: { targetName } };
}
