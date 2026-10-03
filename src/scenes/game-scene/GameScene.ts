import { Scene, Scenes } from 'phaser';
import { createLogger } from '../../core/boot/createLogger';
import { RENDER_CONFIG } from '../../core/config/renderConfig';
import { SCENE_KEYS } from '../../core/constants/SceneKeys';
import type { GameEventBus } from '../../core/events/GameEvents';
import type { IEntityManager } from '../../entities/registry/IEntityManager';
import { createCircleViewFactory } from '../../rendering/entity-views/createCircleViewFactory';
import { EntityViewSystem } from '../../rendering/entity-views/EntityViewSystem';

/** Hosts the world: delivers events, then draws what the entity data says. */
export class GameScene extends Scene {
  private readonly logger = createLogger('GameScene');
  private readonly eventBus: GameEventBus;
  private readonly entityManager: IEntityManager;
  private viewSystem: EntityViewSystem | undefined;

  constructor(eventBus: GameEventBus, entityManager: IEntityManager) {
    super(SCENE_KEYS.GAME);
    this.eventBus = eventBus;
    this.entityManager = entityManager;
  }

  create(): void {
    this.logger.info('GameScene ready.');
    // Subscribe before launching the UI so we cannot miss its events.
    this.subscribeToEvents();
    this.createViewSystem();
    this.scene.launch(SCENE_KEYS.UI);
  }

  update(): void {
    // Temporary home of the frame order until the main loop exists:
    // deliver events first, then draw what the data says.
    this.eventBus.flush();
    this.viewSystem?.update();
  }

  private createViewSystem(): void {
    const viewFactory = createCircleViewFactory(this, RENDER_CONFIG, createLogger('CircleView'));
    const viewSystem = new EntityViewSystem(
      this.entityManager,
      this.eventBus,
      viewFactory,
      createLogger('EntityViewSystem'),
    );
    viewSystem.start();
    this.events.once(Scenes.Events.SHUTDOWN, () => viewSystem.destroy());
    this.viewSystem = viewSystem;
  }

  private subscribeToEvents(): void {
    const unsubscribe = this.eventBus.on('UIReady', (event) => {
      this.logger.info(`UI reported ready at ${Math.round(event.readyAtMs)} ms.`);
    });
    this.events.once(Scenes.Events.SHUTDOWN, unsubscribe);
  }
}
