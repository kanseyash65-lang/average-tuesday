import type { ISpawnable, ISpawnRequest } from '../Command';
import {
  DEFAULT_SPAWN_QUANTITY,
  SPAWNABLE_WORDS,
  SPAWN_EXAMPLE,
  SPAWN_VERBS,
} from '../vocabulary/spawnVocabulary';
import { lookup } from '../vocabulary/vocabulary';
import { parseQuantity } from './parseQuantity';

export type SpawnParseResult =
  | { readonly ok: true; readonly request: ISpawnRequest }
  | { readonly ok: false; readonly reason: string };

/** True when any word means "create". */
export function hasSpawnVerb(tokens: readonly string[]): boolean {
  return tokens.some((token) => SPAWN_VERBS.has(token));
}

function findSpawnable(tokens: readonly string[]): ISpawnable | undefined {
  for (const token of tokens) {
    const spawnable = lookup(SPAWNABLE_WORDS, token);
    if (spawnable !== undefined) return spawnable;
  }
  return undefined;
}

/** Works out what to create and how many. Only call this when hasSpawnVerb is true. */
export function parseSpawn(tokens: readonly string[]): SpawnParseResult {
  const spawnable = findSpawnable(tokens);
  if (spawnable === undefined) {
    return { ok: false, reason: `I don't know how to create that yet. Try "${SPAWN_EXAMPLE}".` };
  }
  const quantity = parseQuantity(tokens) ?? DEFAULT_SPAWN_QUANTITY;
  return { ok: true, request: { spawnable, quantity } };
}
