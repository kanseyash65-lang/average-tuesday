import { Game } from 'phaser';
import { createLogger } from './core/boot/createLogger';
import { createPhaserConfig } from './core/boot/createPhaserConfig';
import { EVENT_CONFIG } from './core/config/eventConfig';
import { EventBus } from './core/events/EventBus';
import type { IGameEventMap } from './core/events/GameEvents';
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

// Order matters: later scenes render on top of earlier ones.
const SCENES = [BootScene, LoadingScene, new GameScene(eventBus), new UIScene(eventBus)];

try {
  logger.info('Starting Average Tuesday.');
  new Game(createPhaserConfig(SCENES));
} catch (error) {
  logger.fatal(`Failed to start the engine: ${String(error)}`);
}