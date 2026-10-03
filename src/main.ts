import { Game } from 'phaser';
import { createLogger } from './core/boot/createLogger';
import { createPhaserConfig } from './core/boot/createPhaserConfig';
import { BootScene } from './scenes/boot-scene/BootScene';
import { GameScene } from './scenes/game-scene/GameScene';
import { LoadingScene } from './scenes/loading-scene/LoadingScene';
import { UIScene } from './scenes/ui-scene/UIScene';

const logger = createLogger('Main');

// Order matters: later scenes render on top of earlier ones.
const SCENES = [BootScene, LoadingScene, GameScene, UIScene];

try {
  logger.info('Starting Average Tuesday.');
  new Game(createPhaserConfig(SCENES));
} catch (error) {
  logger.fatal(`Failed to start the engine: ${String(error)}`);
}