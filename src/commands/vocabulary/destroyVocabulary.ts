/** Words that mean "remove from the world". Hiding and vanishing are separate: they only hide. */
export const DESTROY_VERBS: ReadonlySet<string> = new Set([
  'delete',
  'remove',
  'destroy',
  'erase',
  'despawn',
]);

/** Shown to the player when it is unclear what to delete. */
export const DESTROY_EXAMPLE = 'delete all the chickens';
