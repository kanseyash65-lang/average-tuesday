import { describe, expect, it } from 'vitest';
import type { ISpawnConfig } from '../../core/config/spawnConfig';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import { CHICKEN_DEFINITION } from '../definitions/chickenDefinition';
import { SUN_DEFINITION } from '../definitions/sunDefinition';
import { EntityManager } from '../registry/EntityManager';
import { EntityFactory } from './EntityFactory';
import { EntityIdGenerator } from './EntityIdGenerator';
import { EntitySpawner } from './EntitySpawner';

const TEST_CONFIG: ISpawnConfig = {
  maxPerCommand: 3,
  maxTotalEntities: 5,
  area: { minX: 100, maxX: 200, minY: 300, maxY: 400 },
};

function createSetup(random: () => number = () => 0.5) {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 1000);
  const manager = new EntityManager(bus, logger);
  const factory = new EntityFactory(manager, new EntityIdGenerator(6));
  const definitions = new Map([[CHICKEN_DEFINITION.entityType, CHICKEN_DEFINITION]]);
  const spawner = new EntitySpawner(factory, manager, TEST_CONFIG, definitions, random);
  return { spawner, manager, factory };
}

describe('EntitySpawner', () => {
  it('creates the requested number of registered entities', () => {
    const { spawner, manager } = createSetup();
    const outcome = spawner.spawn('chicken', 2);
    expect(outcome).toEqual({ requested: 2, spawned: 2, limit: 'none' });
    expect(manager.getAll().map((entity) => entity.id)).toEqual(['chicken_000001', 'chicken_000002']);
  });

  it('places each entity at a random spot inside the spawn area', () => {
    const values = [0.1, 0.9, 0.3, 0.7];
    let next = 0;
    const { spawner, manager } = createSetup(() => values[next++ % values.length] ?? 0);
    spawner.spawn('chicken', 2);
    const [first, second] = manager.getAll();
    expect(first?.components.transform?.x).toBeCloseTo(110);
    expect(first?.components.transform?.y).toBeCloseTo(390);
    expect(second?.components.transform?.x).toBeCloseTo(130);
    expect(second?.components.transform?.y).toBeCloseTo(370);
  });

  it('never changes the shared definition', () => {
    const { spawner } = createSetup();
    spawner.spawn('chicken', 2);
    expect(CHICKEN_DEFINITION.components.transform).toEqual({ x: 0, y: 0, rotation: 0, scale: 1 });
  });

  it('stops at the per-command limit and says so', () => {
    const { spawner, manager } = createSetup();
    const outcome = spawner.spawn('chicken', 10);
    expect(outcome).toEqual({ requested: 10, spawned: 3, limit: 'perCommand' });
    expect(manager.count).toBe(3);
  });

  it('stops when the world is full and says so', () => {
    const { spawner, manager, factory } = createSetup();
    factory.create(SUN_DEFINITION);
    factory.create(SUN_DEFINITION);
    factory.create(SUN_DEFINITION);
    expect(spawner.spawn('chicken', 3)).toEqual({ requested: 3, spawned: 2, limit: 'worldFull' });
    expect(manager.count).toBe(5);
    expect(spawner.spawn('chicken', 1)).toEqual({ requested: 1, spawned: 0, limit: 'worldFull' });
  });

  it('returns undefined for an entity type that cannot be spawned', () => {
    const { spawner, manager } = createSetup();
    expect(spawner.spawn('dragon', 1)).toBeUndefined();
    expect(manager.count).toBe(0);
  });
});
