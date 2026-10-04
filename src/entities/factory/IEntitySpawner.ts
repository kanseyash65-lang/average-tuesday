/** What a spawn request achieved, and what (if anything) held it back. */
export interface ISpawnOutcome {
  readonly requested: number;
  readonly spawned: number;
  /** none = everything asked for appeared. */
  readonly limit: 'none' | 'perCommand' | 'worldFull';
}

/** Creates many entities of one type at once. */
export interface IEntitySpawner {
  /** Returns undefined when the entity type is not spawnable. */
  spawn(entityType: string, quantity: number): ISpawnOutcome | undefined;
}
