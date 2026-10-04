import { GAME_CONFIG } from './gameConfig';

/** The rectangle new entities appear in, in world pixels. */
export interface ISpawnArea {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export interface ISpawnConfig {
  /** Most entities one spoken command may create. */
  readonly maxPerCommand: number;
  /** Most entities the world may hold. Each one costs a few Phaser objects until pooling exists. */
  readonly maxTotalEntities: number;
  readonly area: ISpawnArea;
}

const SIDE_MARGIN_PIXELS = 60;
/** Keeps new entities below the sun and the title. */
const TOP_MARGIN_PIXELS = 220;
/** Keeps new entities clear of the command bar overlay. */
const BOTTOM_MARGIN_PIXELS = 140;

export const SPAWN_CONFIG: ISpawnConfig = {
  maxPerCommand: 500,
  maxTotalEntities: 1500,
  area: {
    minX: SIDE_MARGIN_PIXELS,
    maxX: GAME_CONFIG.width - SIDE_MARGIN_PIXELS,
    minY: TOP_MARGIN_PIXELS,
    maxY: GAME_CONFIG.height - BOTTOM_MARGIN_PIXELS,
  },
};
