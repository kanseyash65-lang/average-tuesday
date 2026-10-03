import type { IRenderComponent } from './IRenderComponent';
import type { ITransformComponent } from './ITransformComponent';

/** Every component an entity can carry, keyed by name. New components are added here. */
export interface IComponentMap {
  transform: ITransformComponent;
  render: IRenderComponent;
}

export type ComponentKey = keyof IComponentMap;