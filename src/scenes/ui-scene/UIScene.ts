import { Scene } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';
import { UI_CONFIG } from '../../core/config/uiConfig';

/** Will host the command bar, HUD and panels. Shows only a title for now. */
export class UIScene extends Scene {
  private readonly logger = createLogger('UIScene');

  constructor() {
    super(SCENE_KEYS.UI);
  }

  create(): void {
    this.add.text(UI_CONFIG.margin, UI_CONFIG.margin, UI_CONFIG.titleText, UI_CONFIG.titleStyle);
    this.logger.info('UIScene ready.');
  }
}