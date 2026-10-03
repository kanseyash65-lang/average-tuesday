/** Back-to-front draw order from 07_GAME_ARCHITECTURE Part 3. Never rely on creation order. */
export const RENDER_LAYERS = {
  SKY_GRADIENT: 0,
  STARS: 1,
  CELESTIAL: 2,
  MOUNTAINS: 3,
  TERRAIN: 4,
  VEGETATION: 5,
  BUILDINGS: 6,
  CREATURES: 7,
  PARTICLES: 8,
  DEBUG: 9,
  HUD: 10,
} as const;