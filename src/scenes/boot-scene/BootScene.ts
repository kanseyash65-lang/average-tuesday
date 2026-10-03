import { Scene } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';

/** Engine setup only. Hands off to LoadingScene immediately. */
export class BootScene extends Scene {
  private readonly logger = createLogger('BootScene');

  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create(): void {
    this.logger.info('Engine booted. Starting loading phase.');
    this.scene.start(SCENE_KEYS.LOADING);
  }
}