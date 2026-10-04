import { CHICKEN_DEFINITION } from './chickenDefinition';
import type { IEntityDefinition } from './IEntityDefinition';

/** Every entity type the player can spawn, by entityType. A new creature is one new line. */
export const SPAWNABLE_DEFINITIONS: ReadonlyMap<string, IEntityDefinition> = new Map([
  [CHICKEN_DEFINITION.entityType, CHICKEN_DEFINITION],
]);
