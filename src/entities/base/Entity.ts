import type { ComponentKey, IComponentMap } from '../components/ComponentMap';

/** Format: <type>_<counter>, for example sun_000001. Always reference entities by id. */
export type EntityId = string;

/** Identity plus a bag of components. Entities own data; systems own behaviour. */
export interface IEntity {
  readonly id: EntityId;
  readonly entityType: string;
  readonly name: string;
  readonly displayName: string;
  enabled: boolean;
  readonly tags: readonly string[];
  readonly components: Partial<IComponentMap>;
}

/** An entity known to carry every component in K, so no undefined checks are needed. */
export type EntityWith<K extends ComponentKey> = IEntity & {
  readonly components: Required<Pick<IComponentMap, K>>;
};