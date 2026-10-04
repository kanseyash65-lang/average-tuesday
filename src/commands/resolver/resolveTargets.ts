import type { IEntity } from '../../entities/base/Entity';
import type { IEntityManager } from '../../entities/registry/IEntityManager';

/** Finds the entities a spoken name refers to. */
export function resolveTargets(manager: IEntityManager, targetName: string): readonly IEntity[] {
  // Scans by name for now. Add a name index when named lookups become frequent.
  return manager.getAll().filter((entity) => entity.name === targetName);
}
