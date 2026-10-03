import type { EntityId } from '../base/Entity';

/** Produces ids like sun_000001, counting separately for each entity type. */
export class EntityIdGenerator {
  private readonly digits: number;
  private readonly counters = new Map<string, number>();

  constructor(digits: number) {
    this.digits = digits;
  }

  next(entityType: string): EntityId {
    const value = (this.counters.get(entityType) ?? 0) + 1;
    this.counters.set(entityType, value);
    return `${entityType}_${String(value).padStart(this.digits, '0')}`;
  }
}