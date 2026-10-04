import type { IDestroyRequest, IParsedRequest, ISpawnRequest } from '../Command';
import { hasDestroyVerb, parseDestroy } from './parseDestroy';
import { parseRequest } from './parseRequest';
import { hasSpawnVerb, parseSpawn } from './parseSpawn';

interface IParseFailure {
  readonly ok: false;
  readonly reason: string;
}

export type ParsedCommand =
  | { readonly ok: true; readonly kind: 'modify'; readonly request: IParsedRequest }
  | { readonly ok: true; readonly kind: 'spawn'; readonly request: ISpawnRequest }
  | { readonly ok: true; readonly kind: 'destroy'; readonly request: IDestroyRequest }
  | IParseFailure;

function parseAsModify(tokens: readonly string[]): ParsedCommand {
  const result = parseRequest(tokens);
  return result.ok ? { ok: true, kind: 'modify', request: result.request } : result;
}

/** A create-word or delete-word that found nothing to act on may still be an ordinary change. */
function orModify(tokens: readonly string[], failure: IParseFailure): ParsedCommand {
  const modify = parseAsModify(tokens);
  return modify.ok ? modify : failure;
}

/**
 * Decides what kind of command was spoken: spawn (create-word + something creatable),
 * destroy (delete-word + a target), or otherwise a change to existing things.
 * If a create/delete attempt does not fit, the words are tried as a change, so
 * "add some green to the sun" still works; if nothing fits, the attempt explains itself.
 */
export function parseCommand(tokens: readonly string[]): ParsedCommand {
  if (hasSpawnVerb(tokens)) {
    const spawn = parseSpawn(tokens);
    if (spawn.ok) return { ok: true, kind: 'spawn', request: spawn.request };
    return orModify(tokens, spawn);
  }
  if (hasDestroyVerb(tokens)) {
    const destroy = parseDestroy(tokens);
    if (destroy.ok) return { ok: true, kind: 'destroy', request: destroy.request };
    return orModify(tokens, destroy);
  }
  return parseAsModify(tokens);
}
