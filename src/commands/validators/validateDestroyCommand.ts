import type { IEntity } from '../../entities/base/Entity';
import type { IDestroyCommand } from '../Command';
import { isProtected } from '../executor/executeDestroy';

/** Returns a readable reason if nothing can be deleted, or undefined if something can. */
export function validateDestroyCommand(
  command: IDestroyCommand,
  targets: readonly IEntity[],
  protectedTags: readonly string[],
): string | undefined {
  if (targets.length === 0) {
    return `I couldn't find "${command.targetName}" in the world.`;
  }
  if (targets.every((entity) => isProtected(entity, protectedTags))) {
    const first = targets[0];
    return `${first?.displayName ?? command.targetName} can't be deleted.`;
  }
  return undefined;
}
