import { describe, expect, it } from 'vitest';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import type { IEntity } from '../../entities/base/Entity';
import { EntityManager } from '../../entities/registry/EntityManager';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import { executeDestroy, isProtected } from './executeDestroy';

function entity(id: string, tags: string[]): IEntity {
  return { id, entityType: 'test', name: 'test', displayName: 'Test', enabled: true, tags, components: {} };
}

function createManager(): EntityManager {
  const logger = createFakeLogger();
  return new EntityManager(new EventBus<IGameEventMap>(logger, 100), logger);
}

describe('executeDestroy', () => {
  it('removes unprotected targets and counts them', () => {
    const manager = createManager();
    const targets = [entity('a_000001', ['animal']), entity('a_000002', ['animal'])];
    targets.forEach((target) => manager.register(target));
    expect(executeDestroy(manager, targets, ['celestial'])).toEqual({ destroyed: 2, skipped: 0 });
    expect(manager.count).toBe(0);
  });

  it('leaves protected targets alone and counts them as skipped', () => {
    const manager = createManager();
    const sun = entity('sun_000001', ['celestial']);
    const hen = entity('chicken_000001', ['animal']);
    manager.register(sun);
    manager.register(hen);
    expect(executeDestroy(manager, [sun, hen], ['celestial'])).toEqual({ destroyed: 1, skipped: 1 });
    expect(manager.get('sun_000001')).toBe(sun);
  });

  it('knows which entities are protected', () => {
    expect(isProtected(entity('a_000001', ['celestial']), ['celestial'])).toBe(true);
    expect(isProtected(entity('a_000001', ['animal']), ['celestial'])).toBe(false);
  });
});
