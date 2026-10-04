import type { IEntity } from '../../entities/base/Entity';
import type { ICommand } from '../Command';
import { PROPERTY_EDITORS } from '../executor/propertyEditors';

/** Returns a readable reason if the command cannot run, or undefined if it can. */
export function validateCommand(command: ICommand, targets: readonly IEntity[]): string | undefined {
  if (targets.length === 0) {
    return `I couldn't find "${command.targetName}" in the world.`;
  }
  const editor = PROPERTY_EDITORS[command.property];
  const incapable = targets.find((entity) => entity.components[editor.requiredComponent] === undefined);
  if (incapable) {
    return `${incapable.displayName} doesn't have a ${command.property} I can change.`;
  }
  return undefined;
}
