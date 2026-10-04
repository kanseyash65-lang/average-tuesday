import type { ISpawnCommand } from '../Command';

/** Returns a readable reason if the spawn cannot run, or undefined if it can. */
export function validateSpawnCommand(command: ISpawnCommand): string | undefined {
  if (command.quantity < 1) {
    return `Spawning zero ${command.spawnable.pluralName} wouldn't change anything. Try a bigger number.`;
  }
  return undefined;
}
