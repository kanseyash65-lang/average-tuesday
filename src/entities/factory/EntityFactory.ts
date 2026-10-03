import type { IEntity } from '../base/Entity';
import type { IEntityDefinition } from '../definitions/IEntityDefinition';
import type { IEntityManager } from '../registry/IEntityManager';
import type { EntityIdGenerator } from './EntityIdGenerator';

/** Builds entities from definitions and registers them with the manager. */
export class EntityFactory {
  private readonly manager: IEntityManager;
  private readonly idGenerator: EntityIdGenerator;

  constructor(manager: IEntityManager, idGenerator: EntityIdGenerator) {
    this.manager = manager;
    this.idGenerator = idGenerator;
  }

  /** Returns the new entity, or undefined if the manager refused to register it. */
  create(definition: IEntityDefinition): IEntity | undefined {
    const entity: IEntity = {
      id: this.idGenerator.next(definition.entityType),
      entityType: definition.entityType,
      name: definition.name,
      displayName: definition.displayName,
      enabled: true,
      tags: [...definition.tags],
      // Each entity gets its own copy, so editing one never changes the shared template.
      components: structuredClone(definition.components),
    };
    return this.manager.register(entity) ? entity : undefined;
  }
}