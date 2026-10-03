import type { IComponentMap } from '../components/ComponentMap';

/** A data template for an entity type. Starting values live here, not in code. */
export interface IEntityDefinition {
  readonly entityType: string;
  readonly name: string;
  readonly displayName: string;
  readonly tags: readonly string[];
  readonly components: Partial<IComponentMap>;
}