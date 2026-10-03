import { describe, expect, it } from 'vitest';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import type { IEntityDefinition } from '../definitions/IEntityDefinition';
import { EntityManager } from '../registry/EntityManager';
import { EntityFactory } from './EntityFactory';
import { EntityIdGenerator } from './EntityIdGenerator';

const TEST_DEFINITION: IEntityDefinition = {
  entityType: 'sun',
  name: 'sun',
  displayName: 'The Sun',
  tags: ['celestial'],
  components: { transform: { x: 10, y: 20, rotation: 0, scale: 1 } },
};

function createFactory(): { factory: EntityFactory; manager: EntityManager } {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 100);
  const manager = new EntityManager(bus, logger);
  return { factory: new EntityFactory(manager, new EntityIdGenerator(6)), manager };
}

describe('EntityIdGenerator', () => {
  it('counts per type and pads with zeros', () => {
    const generator = new EntityIdGenerator(6);
    expect(generator.next('sun')).toBe('sun_000001');
    expect(generator.next('sun')).toBe('sun_000002');
    expect(generator.next('tree')).toBe('tree_000001');
  });
});

describe('EntityFactory', () => {
  it('builds entities from a definition and registers them', () => {
    const { factory, manager } = createFactory();
    const first = factory.create(TEST_DEFINITION);
    const second = factory.create(TEST_DEFINITION);
    expect(first?.id).toBe('sun_000001');
    expect(second?.id).toBe('sun_000002');
    expect(first?.tags).toEqual(['celestial']);
    expect(manager.count).toBe(2);
  });

  it('gives each entity its own copy of the components', () => {
    const { factory } = createFactory();
    const entity = factory.create(TEST_DEFINITION);
    const transform = entity?.components.transform;
    if (!transform) throw new Error('transform component missing');
    transform.x = 999;
    expect(TEST_DEFINITION.components.transform?.x).toBe(10);
  });
});