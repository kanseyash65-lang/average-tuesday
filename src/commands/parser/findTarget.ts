import { TARGET_ALIASES } from '../vocabulary/targetVocabulary';
import { lookup } from '../vocabulary/vocabulary';

/** The target name of the first target word in the sentence, if there is one. */
export function findTarget(tokens: readonly string[]): string | undefined {
  for (const token of tokens) {
    const target = lookup(TARGET_ALIASES, token);
    if (target !== undefined) return target;
  }
  return undefined;
}
