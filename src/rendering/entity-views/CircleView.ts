import type { GameObjects, Scene } from 'phaser';
import type { IRenderConfig } from '../../core/config/renderConfig';
import type { IRenderComponent } from '../../entities/components/IRenderComponent';
import type { ITransformComponent } from '../../entities/components/ITransformComponent';
import type { ILogger } from '../../utils/logger/ILogger';
import { hexToNumber } from '../../utils/color/hexToNumber';
import type { IEntityView } from './IEntityView';

/** A glowing circle: a soft halo behind a solid core. Placeholder art for any entity. */
export class CircleView implements IEntityView {
  private readonly config: IRenderConfig;
  private readonly logger: ILogger;
  private readonly container: GameObjects.Container;
  private readonly halo: GameObjects.Arc;
  private readonly core: GameObjects.Arc;
  private appliedTint: string | undefined;

  constructor(scene: Scene, baseRadius: number, config: IRenderConfig, logger: ILogger) {
    this.config = config;
    this.logger = logger;
    this.halo = scene.add.circle(0, 0, baseRadius * config.haloScale);
    this.core = scene.add.circle(0, 0, baseRadius);
    this.container = scene.add.container(0, 0, [this.halo, this.core]);
  }

  apply(transform: ITransformComponent, render: IRenderComponent, enabled: boolean): void {
    this.container.setPosition(transform.x, transform.y);
    this.container.setScale(transform.scale);
    this.container.setRotation(transform.rotation);
    this.container.setAlpha(render.opacity);
    this.container.setDepth(render.layer);
    this.container.setVisible(render.visible && enabled);
    this.applyTint(render.tint);
  }

  destroy(): void {
    this.container.destroy();
  }

  private applyTint(tint: string): void {
    // Only touch the fill styles when the color really changed.
    if (tint === this.appliedTint) return;
    this.appliedTint = tint;
    const color = hexToNumber(tint);
    if (color === undefined) {
      this.logger.warning(`Invalid tint "${tint}"; showing the fallback color.`);
    }
    const shown = color ?? this.config.fallbackColor;
    this.halo.setFillStyle(shown, this.config.haloAlpha);
    this.core.setFillStyle(shown);
  }
}
