import { describe, expect, it } from 'vitest';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import type { IEntity } from '../../entities/base/Entity';
import { EntityManager } from '../../entities/registry/EntityManager';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import { resolveTargets } from './resolveTargets';

function entity(id: string, name: string, tags: string[]): IEntity {
  return { id, entityType: name, name, displayName: name, enabled: true, tags, components: {} };
}

function createManager(): EntityManager {
  const logger = createFakeLogger();
  const manager = new EntityManager(new EventBus<IGameEventMap>(logger, 100), logger);
  manager.register(entity('sun_000001', 'sun', ['celestial']));
  manager.register(entity('chicken_000001', 'chicken', ['animal']));
  manager.register(entity('chicken_000002', 'chicken', ['animal']));
  return manager;
}

const ids = (found: readonly IEntity[]): string[] => found.map((item) => item.id);

describe('resolveTargets', () => {
  it('finds a single named thing', () => {
    expect(ids(resolveTargets(createManager(), 'sun'))).toEqual(['sun_000001']);
  });

  it('finds every entity with a name', () => {
    expect(ids(resolveTargets(createManager(), 'chicken'))).toEqual(['chicken_000001', 'chicken_000002']);
  });

  it('finds a group by tag', () => {
    expect(ids(resolveTargets(createManager(), 'animal'))).toEqual(['chicken_000001', 'chicken_000002']);
  });

  it('finds everything', () => {
    expect(resolveTargets(createManager(), 'everything')).toHaveLength(3);
  });

  it('finds nothing for an unknown target', () => {
    expect(resolveTargets(createManager(), 'dragon')).toEqual([]);
    expect(resolveTargets(createManager(), 'constructor')).toEqual([]);
  });
});
