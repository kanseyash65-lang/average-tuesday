import { targetNames } from '../vocabulary/targetVocabulary';
import type { IDestroyOutcome } from './executeDestroy';

/** The sentence shown to the player after a delete. */
export function describeDestroy(targetName: string, outcome: IDestroyOutcome): string {
  const { singularName, pluralName } = targetNames(targetName);
  const noun = outcome.destroyed === 1 ? singularName : pluralName;
  const done = `Deleted ${outcome.destroyed} ${noun}`;
  return outcome.skipped > 0 ? `${done} (${outcome.skipped} can't be deleted)` : done;
}
