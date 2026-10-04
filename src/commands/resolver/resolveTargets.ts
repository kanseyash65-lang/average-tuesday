import type { IEntity } from '../../entities/base/Entity';
import type { IEntityManager } from '../../entities/registry/IEntityManager';
import type { ITargetSelector } from '../Command';
import { TARGET_SELECTORS } from '../vocabulary/targetVocabulary';
import { lookup } from '../vocabulary/vocabulary';

type Finder = (manager: IEntityManager, selector: ITargetSelector) => readonly IEntity[];

/** One way of finding entities per selector kind. A new kind of group is one new entry. */
const FINDERS: Readonly<Record<ITargetSelector['kind'], Finder>> = {
  // Scans by name for now. Add a name index when named lookups become frequent.
  name: (manager, selector) => manager.getAll().filter((entity) => entity.name === selector.value),
  tag: (manager, selector) => manager.getByTag(selector.value),
  all: (manager) => manager.getAll(),
};

/** Finds every entity a spoken target name refers to: one thing, or a whole group. */
export function resolveTargets(manager: IEntityManager, targetName: string): readonly IEntity[] {
  const selector = lookup(TARGET_SELECTORS, targetName);
  return selector === undefined ? [] : FINDERS[selector.kind](manager, selector);
}
