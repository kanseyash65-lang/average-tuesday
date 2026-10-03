import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../core/events/EventBus';
import type { IGameEventMap } from '../../core/events/GameEvents';
import type { IEntity } from '../../entities/base/Entity';
import { EntityManager } from '../../entities/registry/EntityManager';
import { createFakeLogger } from '../../utils/testing/createFakeLogger';
import { EntityViewSystem } from './EntityViewSystem';
import type { EntityViewFactory, IEntityView } from './IEntityView';

function createFakeView(): IEntityView {
  return { apply: vi.fn(), destroy: vi.fn() };
}

function createVisibleEntity(id: string, entityType = 'sun'): IEntity {
  return {
    id,
    entityType,
    name: entityType,
    displayName: entityType,
    enabled: true,
    tags: [],
    components: {
      transform: { x: 1, y: 2, rotation: 0, scale: 1 },
      render: { tint: '#ffd54a', opacity: 1, visible: true, layer: 2 },
    },
  };
}

function createSetup(): {
  manager: EntityManager;
  bus: EventBus<IGameEventMap>;
  system: EntityViewSystem;
  views: IEntityView[];
  createdTypes: string[];
} {
  const logger = createFakeLogger();
  const bus = new EventBus<IGameEventMap>(logger, 100);
  const manager = new EntityManager(bus, logger);
  const views: IEntityView[] = [];
  const createdTypes: string[] = [];
  const createView: EntityViewFactory = (entityType) => {
    createdTypes.push(entityType);
    const view = createFakeView();
    views.push(view);
    return view;
  };
  return { manager, bus, system: new EntityViewSystem(manager, bus, createView, logger), views, createdTypes };
}

describe('EntityViewSystem', () => {
  it('creates views for entities that already exist when it starts', () => {
    const { manager, system, views, createdTypes } = createSetup();
    manager.register(createVisibleEntity('sun_000001'));
    system.start();
    expect(views).toHaveLength(1);
    expect(createdTypes).toEqual(['sun']);
  });

  it('creates a view when an entity is spawned later', () => {
    const { manager, bus, system, views } = createSetup();
    system.start();
    manager.register(createVisibleEntity('sun_000001'));
    expect(views).toHaveLength(0);
    bus.flush();
    expect(views).toHaveLength(1);
  });

  it('skips entities that lack a transform or render component', () => {
    const { manager, system, views } = createSetup();
    manager.register({ ...createVisibleEntity('rock_000001'), components: {} });
    const transformOnly = createVisibleEntity('rock_000002');
    manager.register({ ...transformOnly, components: { transform: transformOnly.components.transform } });
    system.start();
    expect(views).toHaveLength(0);
  });

  it('does not create a second view when the queued spawn event arrives', () => {
    const { manager, bus, system, views } = createSetup();
    manager.register(createVisibleEntity('sun_000001'));
    system.start();
    bus.flush();
    expect(views).toHaveLength(1);
  });

  it('applies the entity data to its view on update', () => {
    const { manager, system, views } = createSetup();
    const entity = createVisibleEntity('sun_000001');
    manager.register(entity);
    system.start();
    system.update();
    expect(views[0]?.apply).toHaveBeenCalledWith(
      entity.components.transform,
      entity.components.render,
      true,
    );
  });

  it('shows data changes on the next update', () => {
    const { manager, system, views } = createSetup();
    const entity = createVisibleEntity('sun_000001');
    manager.register(entity);
    system.start();
    system.update();
    const render = entity.components.render;
    if (!render) throw new Error('render component missing');
    render.tint = '#00ff00';
    system.update();
    expect(views[0]?.apply).toHaveBeenCalledTimes(2);
    expect(views[0]?.apply).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ tint: '#00ff00' }),
      true,
    );
  });

  it('removes a view when its entity is destroyed', () => {
    const { manager, bus, system, views } = createSetup();
    manager.register(createVisibleEntity('sun_000001'));
    system.start();
    manager.destroy('sun_000001');
    bus.flush();
    expect(views[0]?.destroy).toHaveBeenCalledTimes(1);
    system.update();
    expect(views[0]?.apply).not.toHaveBeenCalled();
  });

  it('destroys all views and stops listening when the system is destroyed', () => {
    const { manager, bus, system, views } = createSetup();
    manager.register(createVisibleEntity('sun_000001'));
    system.start();
    system.destroy();
    expect(views[0]?.destroy).toHaveBeenCalledTimes(1);
    manager.register(createVisibleEntity('sun_000002'));
    bus.flush();
    expect(views).toHaveLength(1);
  });
});
