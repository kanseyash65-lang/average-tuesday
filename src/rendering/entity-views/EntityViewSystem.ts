import type { GameEventBus } from '../../core/events/GameEvents';
import type { Unsubscribe } from '../../core/events/IEventBus';
import type { EntityId } from '../../entities/base/Entity';
import type { IEntityManager } from '../../entities/registry/IEntityManager';
import type { ILogger } from '../../utils/logger/ILogger';
import type { EntityViewFactory, IEntityView } from './IEntityView';

/**
 * Keeps one view per visible entity and copies entity data onto it every frame.
 * It only reads entity data, never writes it, and contains no Phaser code,
 * so it can be unit-tested.
 */
export class EntityViewSystem {
  private readonly manager: IEntityManager;
  private readonly eventBus: GameEventBus;
  private readonly createView: EntityViewFactory;
  private readonly logger: ILogger;
  private readonly views = new Map<EntityId, IEntityView>();
  private readonly subscriptions: Unsubscribe[] = [];

  constructor(
    manager: IEntityManager,
    eventBus: GameEventBus,
    createView: EntityViewFactory,
    logger: ILogger,
  ) {
    this.manager = manager;
    this.eventBus = eventBus;
    this.createView = createView;
    this.logger = logger;
  }

  start(): void {
    this.subscriptions.push(
      this.eventBus.on('EntitySpawned', (event) => this.addView(event.entityId)),
      this.eventBus.on('EntityDestroyed', (event) => this.removeView(event.entityId)),
    );
    // Entities that already exist get a view now; their queued spawn events
    // arrive later and are ignored as duplicates.
    for (const entity of this.manager.getAll()) this.addView(entity.id);
  }

  /** Called once per frame, after events are delivered. Allocates nothing. */
  update(): void {
    for (const [id, view] of this.views) {
      const entity = this.manager.get(id);
      const transform = entity?.components.transform;
      const render = entity?.components.render;
      if (entity && transform && render) view.apply(transform, render, entity.enabled);
    }
  }

  destroy(): void {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.length = 0;
    for (const view of this.views.values()) view.destroy();
    this.views.clear();
  }

  private addView(id: EntityId): void {
    if (this.views.has(id)) return;
    const entity = this.manager.get(id);
    // Entities without both components have nothing to draw.
    if (!entity || !entity.components.transform || !entity.components.render) return;
    this.views.set(id, this.createView(entity.entityType));
    this.logger.debug(`Created view for ${entity.entityType}.`, { entityId: id });
  }

  private removeView(id: EntityId): void {
    const view = this.views.get(id);
    if (!view) return;
    view.destroy();
    this.views.delete(id);
    this.logger.debug('Removed view.', { entityId: id });
  }
}
