import type { ICommand, PropertyName } from '../Command';
import { targetNames } from '../vocabulary/targetVocabulary';
import type { IExecutionResult } from './executeCommand';

/** How a group's change reads: "50 chickens are now blue", "50 chickens moved left". */
const GROUP_VERBS: Readonly<Record<PropertyName, string>> = {
  color: 'are now',
  size: 'are now',
  visibility: 'are now',
  position: 'moved',
};

/** The sentence shown to the player after a change. One thing keeps its own sentence. */
export function describeChange(command: ICommand, results: readonly IExecutionResult[]): string {
  const only = results[0];
  if (results.length === 1 && only !== undefined) return only.summary;
  const { pluralName } = targetNames(command.targetName);
  return `${results.length} ${pluralName} ${GROUP_VERBS[command.property]} ${command.value.label}`;
}
