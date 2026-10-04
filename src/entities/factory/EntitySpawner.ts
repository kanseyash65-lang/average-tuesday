import type { ISpawnConfig } from '../../core/config/spawnConfig';
import type { RandomSource } from '../../utils/random/RandomSource';
import { randomBetween } from '../../utils/random/randomBetween';
import type { IEntityDefinition } from '../definitions/IEntityDefinition';
import type { IEntityManager } from '../registry/IEntityManager';
import type { EntityFactory } from './EntityFactory';
import type { IEntitySpawner, ISpawnOutcome } from './IEntitySpawner';

const FALLBACK_TRANSFORM = { x: 0, y: 0, rotation: 0, scale: 1 } as const;

/** A copy of the definition that starts at the given position. The original is never changed. */
function placeAt(definition: IEntityDefinition, x: number, y: number): IEntityDefinition {
  const base = definition.components.transform ?? FALLBACK_TRANSFORM;
  return { ...definition, components: { ...definition.components, transform: { ...base, x, y } } };
}

/** Creates entities in bulk, at random places, within the limits in the spawn config. */
export class EntitySpawner implements IEntitySpawner {
  private readonly factory: EntityFactory;
  private readonly manager: IEntityManager;
  private readonly config: ISpawnConfig;
  private readonly definitions: ReadonlyMap<string, IEntityDefinition>;
  private readonly random: RandomSource;

  constructor(
    factory: EntityFactory,
    manager: IEntityManager,
    config: ISpawnConfig,
    definitions: ReadonlyMap<string, IEntityDefinition>,
    random: RandomSource,
  ) {
    this.factory = factory;
    this.manager = manager;
    this.config = config;
    this.definitions = definitions;
    this.random = random;
  }

  spawn(entityType: string, quantity: number): ISpawnOutcome | undefined {
    const definition = this.definitions.get(entityType);
    if (!definition) return undefined;
    const room = Math.max(0, this.config.maxTotalEntities - this.manager.count);
    const allowed = Math.min(quantity, this.config.maxPerCommand, room);
    let spawned = 0;
    for (let index = 0; index < allowed; index += 1) {
      if (this.factory.create(this.placeRandomly(definition))) spawned += 1;
    }
    return { requested: quantity, spawned, limit: this.limitFor(quantity, allowed, room) };
  }

  private placeRandomly(definition: IEntityDefinition): IEntityDefinition {
    const { area } = this.config;
    const x = randomBetween(area.minX, area.maxX, this.random);
    const y = randomBetween(area.minY, area.maxY, this.random);
    return placeAt(definition, x, y);
  }

  private limitFor(quantity: number, allowed: number, room: number): ISpawnOutcome['limit'] {
    if (allowed >= quantity) return 'none';
    return room < this.config.maxPerCommand ? 'worldFull' : 'perCommand';
  }
}
