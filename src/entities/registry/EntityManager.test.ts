import { describe, expect, it } from 'vitest';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import type { ILogger } from '../../utils/logger/ILogger';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import type { IEntity } from '../base/Entity';
import { EntityManager } from './EntityManager';

function createManager(): {
  manager: EntityManager;
  bus: EventBus<IGameEventMap>;
  logger: ILogger;
} {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 100);
  return { manager: new EntityManager(bus, logger), bus, logger };
}

function createTestEntity(
  id: string,
  tags: string[] = [],
  components: IEntity['components'] = {},
): IEntity {
  return { id, entityType: 'test', name: 'test', displayName: 'Test', enabled: true, tags, components };
}

describe('EntityManager', () => {
  it('registers entities and finds them by id', () => {
    const { manager } = createManager();
    const entity = createTestEntity('sun_000001');
    expect(manager.register(entity)).toBe(true);
    expect(manager.get('sun_000001')).toBe(entity);
    expect(manager.count).toBe(1);
  });

  it('rejects duplicate ids and logs an error', () => {
    const { manager, logger } = createManager();
    manager.register(createTestEntity('sun_000001'));
    expect(manager.register(createTestEntity('sun_000001'))).toBe(false);
    expect(manager.count).toBe(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('destroys entities and reports unknown ids', () => {
    const { manager } = createManager();
    manager.register(createTestEntity('sun_000001'));
    expect(manager.destroy('sun_000001')).toBe(true);
    expect(manager.get('sun_000001')).toBeUndefined();
    expect(manager.destroy('nope_000001')).toBe(false);
  });

  it('finds entities by tag and forgets them when destroyed', () => {
    const { manager } = createManager();
    manager.register(createTestEntity('a_000001', ['burnable']));
    manager.register(createTestEntity('b_000001', ['burnable', 'edible']));
    manager.register(createTestEntity('c_000001'));
    expect(manager.getByTag('burnable').map((entity) => entity.id)).toEqual(['a_000001', 'b_000001']);
    manager.destroy('a_000001');
    expect(manager.getByTag('burnable').map((entity) => entity.id)).toEqual(['b_000001']);
    expect(manager.getByTag('missing')).toEqual([]);
  });

  it('withComponents returns only entities that have every requested component', () => {
    const { manager } = createManager();
    const transform = { x: 1, y: 2, rotation: 0, scale: 1 };
    const render = { tint: '#ffffff', opacity: 0.5, visible: true, layer: 2 };
    manager.register(createTestEntity('a_000001', [], { transform }));
    manager.register(createTestEntity('b_000001', [], { transform, render }));
    const result = manager.withComponents('transform', 'render');
    expect(result.map((entity) => entity.id)).toEqual(['b_000001']);
    expect(result[0]?.components.render.opacity).toBe(0.5);
  });

  it('announces spawns and destroys as events', () => {
    const { manager, bus } = createManager();
    const spawned: string[] = [];
    const destroyed: string[] = [];
    bus.on('EntitySpawned', (event) => spawned.push(event.entityId));
    bus.on('EntityDestroyed', (event) => destroyed.push(event.entityId));
    manager.register(createTestEntity('sun_000001'));
    manager.destroy('sun_000001');
    expect(spawned).toEqual([]);
    bus.flush();
    expect(spawned).toEqual(['sun_000001']);
    expect(destroyed).toEqual(['sun_000001']);
  });
});