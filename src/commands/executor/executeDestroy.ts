import type { IEntity } from '../../entities/base/Entity';
import type { IEntityManager } from '../../entities/registry/IEntityManager';

export interface IDestroyOutcome {
  readonly destroyed: number;
  /** Targets that were left alone because they are protected. */
  readonly skipped: number;
}

/** True when the entity carries any tag that forbids deleting it. */
export function isProtected(entity: IEntity, protectedTags: readonly string[]): boolean {
  return entity.tags.some((tag) => protectedTags.includes(tag));
}

/** Removes every unprotected target from the world. Never parses language. */
export function executeDestroy(
  manager: IEntityManager,
  targets: readonly IEntity[],
  protectedTags: readonly string[],
): IDestroyOutcome {
  let destroyed = 0;
  let skipped = 0;
  for (const entity of targets) {
    if (isProtected(entity, protectedTags)) {
      skipped += 1;
    } else if (manager.destroy(entity.id)) {
      destroyed += 1;
    }
  }
  return { destroyed, skipped };
}
