import type { IParsedRequest, ISpawnRequest } from '../Command';
import { hasSpawnVerb, parseSpawn } from './parseSpawn';
import { parseRequest } from './parseRequest';

export type ParsedCommand =
  | { readonly ok: true; readonly kind: 'modify'; readonly request: IParsedRequest }
  | { readonly ok: true; readonly kind: 'spawn'; readonly request: ISpawnRequest }
  | { readonly ok: false; readonly reason: string };

function parseAsModify(tokens: readonly string[]): ParsedCommand {
  const result = parseRequest(tokens);
  return result.ok ? { ok: true, kind: 'modify', request: result.request } : result;
}

/**
 * Decides what kind of command was spoken. A create-word plus something creatable means
 * spawn. Otherwise the words are tried as a change to an existing thing, so "add some green
 * to the sun" still works. If neither fits, a spawn attempt explains itself as a spawn.
 */
export function parseCommand(tokens: readonly string[]): ParsedCommand {
  if (!hasSpawnVerb(tokens)) return parseAsModify(tokens);
  const spawn = parseSpawn(tokens);
  if (spawn.ok) return { ok: true, kind: 'spawn', request: spawn.request };
  const modify = parseAsModify(tokens);
  return modify.ok ? modify : spawn;
}
