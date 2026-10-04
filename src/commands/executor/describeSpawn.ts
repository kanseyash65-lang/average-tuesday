import type { ISpawnOutcome } from '../../entities/factory/IEntitySpawner';
import type { ISpawnable } from '../Command';

function countText(count: number, spawnable: ISpawnable): string {
  return `${count} ${count === 1 ? spawnable.singularName : spawnable.pluralName}`;
}

/** The sentence shown to the player after a spawn that created at least one entity. */
export function describeSpawn(spawnable: ISpawnable, outcome: ISpawnOutcome): string {
  const done = `Spawned ${countText(outcome.spawned, spawnable)}`;
  if (outcome.limit === 'none') return done;
  const reason = outcome.limit === 'worldFull' ? 'the world is full' : 'the most I can spawn at once';
  return `${done} (${reason}; you asked for ${outcome.requested})`;
}
