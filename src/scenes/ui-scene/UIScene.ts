import { Scene } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { UI_CONFIG } from '../../core/config/uiConfig';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';
import type { GameEventBus } from '../../core/events/GameEvents';

/** Will host the command bar, HUD and panels. Shows only a title for now. */
export class UIScene extends Scene {
  private readonly logger = createLogger('UIScene');
  private readonly eventBus: GameEventBus;

  constructor(eventBus: GameEventBus) {
    super(SCENE_KEYS.UI);
    this.eventBus = eventBus;
  }

  create(): void {
    this.add.text(UI_CONFIG.margin, UI_CONFIG.margin, UI_CONFIG.titleText, UI_CONFIG.titleStyle);
    this.logger.info('UIScene ready.');
    this.eventBus.emit('UIReady', { readyAtMs: this.time.now });
  }
}