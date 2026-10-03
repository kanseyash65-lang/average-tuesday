import type { IRenderComponent } from '../../entities/components/IRenderComponent';
import type { ITransformComponent } from '../../entities/components/ITransformComponent';

/** The picture of one entity on screen. The renderer reads entity data and shows it here. */
export interface IEntityView {
  /** Copies the entity's current data onto the picture. Must never change that data. */
  apply(transform: ITransformComponent, render: IRenderComponent, enabled: boolean): void;
  destroy(): void;
}

/** Builds the right kind of view for an entity type. */
export type EntityViewFactory = (entityType: string) => IEntityView;
