import type { EntityId, EntityWith, IEntity } from '../base/Entity';
import type { ComponentKey } from '../components/ComponentMap';

/** Stores every entity and answers lookups. Contains no gameplay rules. */
export interface IEntityManager {
  readonly count: number;

  /** Adds an entity. Returns false (and logs) if its id is already taken. */
  register(entity: IEntity): boolean;

  /** Removes an entity. Returns false if the id is unknown. */
  destroy(id: EntityId): boolean;

  get(id: EntityId): IEntity | undefined;
  getAll(): readonly IEntity[];
  getByTag(tag: string): readonly IEntity[];

  /** Entities that carry every listed component, typed so those components are never undefined. */
  withComponents<K extends ComponentKey>(...keys: K[]): EntityWith<K>[];
}