export const COMMAND_CONFIG = {
  idDigits: 6,
  /** Smallest and largest scale a spoken "smaller" or "bigger" can reach. */
  minScale: 0.2,
  maxScale: 6,
  /** How far one spoken "left/right/up/down" moves something, in world pixels. */
  moveStepPixels: 120,
  exactConfidence: 1,
  /** Used when the normalizer had to fix a likely mishearing. */
  correctedConfidence: 0.8,
} as const;
