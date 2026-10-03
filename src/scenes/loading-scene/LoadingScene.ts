import { Scene } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';

/** Will own asset loading and the progress UI once AssetManager exists. */
export class LoadingScene extends Scene {
  private readonly logger = createLogger('LoadingScene');

  constructor() {
    super(SCENE_KEYS.LOADING);
  }

  create(): void {
    this.logger.info('No assets to load yet. Entering the game.');
    this.scene.start(SCENE_KEYS.GAME);
  }
}