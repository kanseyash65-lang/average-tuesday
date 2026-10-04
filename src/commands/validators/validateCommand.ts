import type { IEntity } from '../../entities/base/Entity';
import type { ICommand } from '../Command';
import { PROPERTY_EDITORS } from '../executor/propertyEditors';

/**
 * Returns a readable reason if the command cannot run, or undefined if it can.
 * In a group, things that lack the property are skipped; it only fails if none have it.
 */
export function validateCommand(command: ICommand, targets: readonly IEntity[]): string | undefined {
  if (targets.length === 0) {
    return `I couldn't find "${command.targetName}" in the world.`;
  }
  const editor = PROPERTY_EDITORS[command.property];
  const capable = targets.some((entity) => entity.components[editor.requiredComponent] !== undefined);
  if (!capable) {
    const first = targets[0];
    return `${first?.displayName ?? command.targetName} doesn't have a ${command.property} I can change.`;
  }
  return undefined;
}
