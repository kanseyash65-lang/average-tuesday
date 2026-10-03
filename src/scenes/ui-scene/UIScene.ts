import { Scene, Scenes } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { COMMAND_BAR_CONFIG } from '../../core/config/commandBarConfig';
import { UI_CONFIG } from '../../core/config/uiConfig';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';
import type { GameEventBus } from '../../core/events/GameEvents';
import { CommandBar } from '../../ui/commandbar/CommandBar';

/** Hosts the interface: title, and the voice command bar. */
export class UIScene extends Scene {
  private readonly logger = createLogger('UIScene');
  private readonly eventBus: GameEventBus;

  constructor(eventBus: GameEventBus) {
    super(SCENE_KEYS.UI);
    this.eventBus = eventBus;
  }

  create(): void {
    this.add.text(UI_CONFIG.margin, UI_CONFIG.margin, UI_CONFIG.titleText, UI_CONFIG.titleStyle);
    this.createCommandBar();
    this.logger.info('UIScene ready.');
    this.eventBus.emit('UIReady', { readyAtMs: this.time.now });
  }

  private createCommandBar(): void {
    const commandBar = new CommandBar(
      document.body,
      this.eventBus,
      createLogger('CommandBar'),
      COMMAND_BAR_CONFIG,
    );
    this.events.once(Scenes.Events.SHUTDOWN, () => commandBar.destroy());
  }
}
