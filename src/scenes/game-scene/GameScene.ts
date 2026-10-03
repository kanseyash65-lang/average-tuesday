import { Scene } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';

/** Will host the world, simulation and rendering. Empty for now. */
export class GameScene extends Scene {
  private readonly logger = createLogger('GameScene');

  constructor() {
    super(SCENE_KEYS.GAME);
  }

  create(): void {
    this.logger.info('GameScene ready. The world arrives in later milestones.');
    this.scene.launch(SCENE_KEYS.UI);
  }
}