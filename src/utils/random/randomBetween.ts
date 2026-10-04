import type { RandomSource } from './RandomSource';

/** A number from min (inclusive) to max (exclusive), drawn from the given random source. */
export function randomBetween(min: number, max: number, random: RandomSource): number {
  return min + random() * (max - min);
}
