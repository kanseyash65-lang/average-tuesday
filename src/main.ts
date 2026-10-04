import { Game } from 'phaser';
import { CommandManager } from './commands/CommandManager';
import { createLogger } from './core/boot/createLogger';
import { createPhaserConfig } from './core/boot/createPhaserConfig';
import { ENTITY_CONFIG } from './core/config/entityConfig';
import { EVENT_CONFIG } from './core/config/eventConfig';
import { EventBus } from './core/events/EventBus';
import type { IGameEventMap } from './core/events/GameEvents';
import { SUN_DEFINITION } from './entities/definitions/sunDefinition';
import { EntityFactory } from './entities/factory/EntityFactory';
import { EntityIdGenerator } from './entities/factory/EntityIdGenerator';
import { EntityManager } from './entities/registry/EntityManager';
import { BootScene } from './scenes/boot-scene/BootScene';
import { GameScene } from './scenes/game-scene/GameScene';
import { LoadingScene } from './scenes/loading-scene/LoadingScene';
import { UIScene } from './scenes/ui-scene/UIScene';

const logger = createLogger('Main');

// Composition root: the one place that creates shared services and hands them out.
const eventBus = new EventBus<IGameEventMap>(
  createLogger('EventBus'),
  EVENT_CONFIG.maxEventsPerFlush,
);
const entityManager = new EntityManager(eventBus, createLogger('EntityManager'));
const entityFactory = new EntityFactory(
  entityManager,
  new EntityIdGenerator(ENTITY_CONFIG.idDigits),
);

const commandManager = new CommandManager(
  eventBus,
  entityManager,
  createLogger('CommandManager'),
);
commandManager.start();

// Order matters: later scenes render on top of earlier ones.
const SCENES = [BootScene, LoadingScene, new GameScene(eventBus, entityManager), new UIScene(eventBus)];

try {
  logger.info('Starting Average Tuesday.');
  entityFactory.create(SUN_DEFINITION);
  const ids = entityManager.getAll().map((entity) => entity.id);
  logger.info(`Initial world ready: ${ids.join(', ')}`);
  new Game(createPhaserConfig(SCENES));
} catch (error) {
  logger.fatal(`Failed to start the engine: ${String(error)}`);
}
