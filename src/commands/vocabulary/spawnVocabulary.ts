import type { ISpawnable } from '../Command';

/**
 * What the command engine can hear when the player wants to create things, as data.
 * To teach it a new creature, add a spawnable and its words here, then add its
 * definition to entities/definitions/spawnableDefinitions.ts.
 */

/** Words that mean "create". Other verbs (turn, make, paint) are still ignored. */
export const SPAWN_VERBS: ReadonlySet<string> = new Set([
  'spawn',
  'summon',
  'create',
  'add',
  'conjure',
  'release',
]);

const CHICKEN: ISpawnable = { entityType: 'chicken', singularName: 'chicken', pluralName: 'chickens' };

/** Spoken noun -> what it creates. Look it up with lookup(), never with plain indexing. */
export const SPAWNABLE_WORDS: Readonly<Record<string, ISpawnable>> = {
  chicken: CHICKEN,
  chickens: CHICKEN,
  chick: CHICKEN,
  chicks: CHICKEN,
  hen: CHICKEN,
  hens: CHICKEN,
  rooster: CHICKEN,
  roosters: CHICKEN,
};

/** Shown to the player when they ask for something that cannot be created. */
export const SPAWN_EXAMPLE = 'spawn 5 chickens';

/** How many to create when the player gives no number, as in "spawn a chicken". */
export const DEFAULT_SPAWN_QUANTITY = 1;

/** Digits above this are treated as this, so absurd numbers stay finite. */
export const MAX_SPOKEN_QUANTITY = 1_000_000_000;

/** Spoken number words that add up: "twenty five" is 25. */
export const NUMBER_WORDS: Readonly<Record<string, number>> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/** Spoken number words that multiply: "two hundred" is 200. "a dozen" is 12. */
export const MULTIPLIER_WORDS: Readonly<Record<string, number>> = {
  dozen: 12,
  hundred: 100,
  thousand: 1000,
};

/** Multipliers at or above this close off a group: "two thousand five hundred" is 2500. */
export const GROUP_MULTIPLIER_MINIMUM = 1000;

/** Vague amounts ("spawn many chickens") and the number they stand for. */
export const QUANTITY_HEURISTICS: Readonly<Record<string, number>> = {
  couple: 2,
  few: 3,
  several: 5,
  some: 5,
  handful: 5,
  bunch: 10,
  many: 20,
  lots: 50,
  loads: 100,
  tons: 200,
  hundreds: 300,
  thousands: 1000,
};
