import type { GameEventBus } from '../../core/events/GameEvents';
import type { ILogger } from '../../utils/logger/ILogger';
import type { EntityId, EntityWith, IEntity } from '../base/Entity';
import type { ComponentKey } from '../components/ComponentMap';
import type { IEntityManager } from './IEntityManager';

function hasComponents<K extends ComponentKey>(
  entity: IEntity,
  keys: readonly K[],
): entity is EntityWith<K> {
  return keys.every((key) => entity.components[key] !== undefined);
}

/** Owns all entities. Announces spawns and destroys through the event bus. */
export class EntityManager implements IEntityManager {
  private readonly logger: ILogger;
  private readonly eventBus: GameEventBus;
  private readonly entities = new Map<EntityId, IEntity>();
  private readonly tagIndex = new Map<string, Set<EntityId>>();

  constructor(eventBus: GameEventBus, logger: ILogger) {
    this.eventBus = eventBus;
    this.logger = logger;
  }

  get count(): number {
    return this.entities.size;
  }

  register(entity: IEntity): boolean {
    if (this.entities.has(entity.id)) {
      this.logger.error('Cannot register entity: id already exists.', { entityId: entity.id });
      return false;
    }
    this.entities.set(entity.id, entity);
    this.indexTags(entity);
    this.logger.debug(`Registered ${entity.entityType}.`, { entityId: entity.id });
    this.eventBus.emit('EntitySpawned', { entityId: entity.id, entityType: entity.entityType });
    return true;
  }

  destroy(id: EntityId): boolean {
    const entity = this.entities.get(id);
    if (!entity) {
      this.logger.warning('Cannot destroy entity: unknown id.', { entityId: id });
      return false;
    }
    this.entities.delete(id);
    this.unindexTags(entity);
    this.logger.debug(`Destroyed ${entity.entityType}.`, { entityId: id });
    this.eventBus.emit('EntityDestroyed', { entityId: id, entityType: entity.entityType });
    return true;
  }

  get(id: EntityId): IEntity | undefined {
    return this.entities.get(id);
  }

  getAll(): readonly IEntity[] {
    return [...this.entities.values()];
  }

  getByTag(tag: string): readonly IEntity[] {
    const ids = this.tagIndex.get(tag);
    if (!ids) return [];
    const result: IEntity[] = [];
    for (const id of ids) {
      const entity = this.entities.get(id);
      if (entity) result.push(entity);
    }
    return result;
  }

  withComponents<K extends ComponentKey>(...keys: K[]): EntityWith<K>[] {
    // Full scan for now. Add a component index when profiling shows it matters.
    return [...this.entities.values()].filter((entity): entity is EntityWith<K> =>
      hasComponents(entity, keys),
    );
  }

  private indexTags(entity: IEntity): void {
    for (const tag of entity.tags) {
      let ids = this.tagIndex.get(tag);
      if (!ids) {
        ids = new Set();
        this.tagIndex.set(tag, ids);
      }
      ids.add(entity.id);
    }
  }

  private unindexTags(entity: IEntity): void {
    for (const tag of entity.tags) {
      const ids = this.tagIndex.get(tag);
      ids?.delete(entity.id);
      if (ids && ids.size === 0) this.tagIndex.delete(tag);
    }
  }
}