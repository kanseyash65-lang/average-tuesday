/**
 * Everything the command engine knows how to hear, as data.
 * To teach the game a new word, add a line here. No other code changes.
 */

/** Safe table lookup: ignores inherited names such as "constructor". */
export function lookup<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}

/** Spoken word -> name of the entity it refers to. */
export const TARGET_ALIASES: Readonly<Record<string, string>> = {
  sun: 'sun',
  sunshine: 'sun',
};

/** Spoken color -> hex color. */
export const COLOR_WORDS: Readonly<Record<string, string>> = {
  red: '#ff3b30',
  orange: '#ff9500',
  yellow: '#ffe033',
  green: '#33dd55',
  blue: '#3b82f6',
  cyan: '#22d3ee',
  purple: '#a855f7',
  pink: '#ff6fb5',
  white: '#ffffff',
  black: '#111111',
  brown: '#8b5a2b',
  gray: '#9ca3af',
  grey: '#9ca3af',
};

export interface ISizeEffect {
  readonly mode: 'multiply' | 'set';
  readonly amount: number;
}

/** Spoken size word -> how scale changes. "multiply" is relative, "set" is absolute. */
export const SIZE_WORDS: Readonly<Record<string, ISizeEffect>> = {
  bigger: { mode: 'multiply', amount: 1.5 },
  larger: { mode: 'multiply', amount: 1.5 },
  grow: { mode: 'multiply', amount: 1.5 },
  smaller: { mode: 'multiply', amount: 0.67 },
  shrink: { mode: 'multiply', amount: 0.67 },
  huge: { mode: 'set', amount: 3 },
  giant: { mode: 'set', amount: 3 },
  enormous: { mode: 'set', amount: 4 },
  tiny: { mode: 'set', amount: 0.4 },
  normal: { mode: 'set', amount: 1 },
};

export interface IVisibilityEffect {
  readonly visible: boolean;
  readonly label: string;
}

export const VISIBILITY_WORDS: Readonly<Record<string, IVisibilityEffect>> = {
  hide: { visible: false, label: 'hidden' },
  vanish: { visible: false, label: 'hidden' },
  disappear: { visible: false, label: 'hidden' },
  invisible: { visible: false, label: 'hidden' },
  show: { visible: true, label: 'visible' },
  appear: { visible: true, label: 'visible' },
  reveal: { visible: true, label: 'visible' },
  visible: { visible: true, label: 'visible' },
};

export interface IDirection {
  readonly dx: number;
  readonly dy: number;
}

/** Spoken direction -> unit direction (screen y grows downward). */
export const DIRECTION_WORDS: Readonly<Record<string, IDirection>> = {
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
  up: { dx: 0, dy: -1 },
  higher: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  lower: { dx: 0, dy: 1 },
};

/** Spelling variants fixed silently (no loss of confidence). */
export const SPELLING_VARIANTS: ReadonlyArray<readonly [string, string]> = [['colour', 'color']];

/**
 * Likely dictation mishearings -> what the player meant. Matches whole words only.
 * Add the odd things Wispr Flow writes (see the console log) and they start working.
 */
export const PHRASE_CORRECTIONS: ReadonlyArray<readonly [string, string]> = [
  ['sun do sun', 'turn the sun'],
  ['turn this on', 'turn the sun'],
  ['this on', 'the sun'],
  ['the son', 'the sun'],
];
