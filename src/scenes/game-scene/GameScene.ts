import { Scene, Scenes } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';
import type { GameEventBus } from '../../core/events/GameEvents';

/** Will host the world, simulation and rendering. Empty for now. */
export class GameScene extends Scene {
  private readonly logger = createLogger('GameScene');
  private readonly eventBus: GameEventBus;

  constructor(eventBus: GameEventBus) {
    super(SCENE_KEYS.GAME);
    this.eventBus = eventBus;
  }

  create(): void {
    this.logger.info('GameScene ready. The world arrives in later milestones.');
    // Subscribe before launching the UI so we cannot miss its events.
    this.subscribeToEvents();
    this.scene.launch(SCENE_KEYS.UI);
  }

  update(): void {
    // Temporary home of the "Event Dispatch" stage until the main loop exists.
    this.eventBus.flush();
  }

  private subscribeToEvents(): void {
    const unsubscribe = this.eventBus.on('UIReady', (event) => {
      this.logger.info(`UI reported ready at ${Math.round(event.readyAtMs)} ms.`);
    });
    this.events.once(Scenes.Events.SHUTDOWN, unsubscribe);
  }
}