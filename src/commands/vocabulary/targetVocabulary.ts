import type { ITargetSelector } from '../Command';
import { lookup } from './vocabulary';

/**
 * Which things a spoken noun can point at, as data.
 * A target word maps to a target name, and each target name has a selector that says
 * how to find its entities. To make a new kind of thing targetable, add lines here.
 * Plural and singular words mean the same group: "the chickens" and "every chicken".
 */

/** Spoken word -> target name. Look it up with lookup(), never with plain indexing. */
export const TARGET_ALIASES: Readonly<Record<string, string>> = {
  sun: 'sun',
  sunshine: 'sun',
  chicken: 'chicken',
  chickens: 'chicken',
  chick: 'chicken',
  chicks: 'chicken',
  hen: 'chicken',
  hens: 'chicken',
  rooster: 'chicken',
  roosters: 'chicken',
  animal: 'animal',
  animals: 'animal',
  creature: 'animal',
  creatures: 'animal',
  everything: 'everything',
};

/** Target name -> how to find its entities. */
export const TARGET_SELECTORS: Readonly<Record<string, ITargetSelector>> = {
  sun: { kind: 'name', value: 'sun', singularName: 'sun', pluralName: 'suns' },
  chicken: { kind: 'name', value: 'chicken', singularName: 'chicken', pluralName: 'chickens' },
  animal: { kind: 'tag', value: 'animal', singularName: 'animal', pluralName: 'animals' },
  everything: { kind: 'all', value: '', singularName: 'thing', pluralName: 'things' },
};

export interface ITargetNames {
  readonly singularName: string;
  readonly pluralName: string;
}

/** How to say a target in a sentence. Falls back to the raw name for unknown targets. */
export function targetNames(targetName: string): ITargetNames {
  return lookup(TARGET_SELECTORS, targetName) ?? { singularName: targetName, pluralName: targetName };
}
