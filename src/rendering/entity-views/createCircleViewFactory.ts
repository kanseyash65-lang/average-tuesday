import type { Scene } from 'phaser';
import type { IRenderConfig } from '../../core/config/renderConfig';
import type { ILogger } from '../../utils/logger/ILogger';
import { CircleView } from './CircleView';
import type { EntityViewFactory } from './IEntityView';

/** Draws every entity type as a circle sized by its style in the render config. */
export function createCircleViewFactory(
  scene: Scene,
  config: IRenderConfig,
  logger: ILogger,
): EntityViewFactory {
  return (entityType) => {
    const style = config.styles[entityType] ?? config.defaultStyle;
    return new CircleView(scene, style.baseRadius, config, logger);
  };
}
