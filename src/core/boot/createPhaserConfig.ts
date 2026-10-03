import { AUTO, Scale, type Types } from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/** Builds the Phaser config from project config. Scenes are passed in by main.ts. */
export function createPhaserConfig(scenes: Types.Scenes.SceneType[]): Types.Core.GameConfig {
  return {
    type: AUTO,
    parent: GAME_CONFIG.parentElementId,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.backgroundColor,
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    scene: scenes,
  };
}