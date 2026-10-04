import { COMMAND_CONFIG } from '../../core/config/commandConfig';
import { GAME_CONFIG } from '../../core/config/gameConfig';
import type { IEntity } from '../../entities/base/Entity';
import type { ComponentKey } from '../../entities/components/ComponentMap';
import { clamp } from '../../utils/math/clamp';
import type { CommandValue, PropertyName } from '../Command';

/** Knows how to change one spoken property on an entity's component data. */
export interface IPropertyEditor {
  /** The component an entity must have for this property to exist on it. */
  readonly requiredComponent: ComponentKey;
  /** Edits the entity and returns a short summary, or undefined if it could not. */
  apply(entity: IEntity, value: CommandValue): string | undefined;
}

const colorEditor: IPropertyEditor = {
  requiredComponent: 'render',
  apply(entity, value) {
    const render = entity.components.render;
    if (value.kind !== 'color' || !render) return undefined;
    render.tint = value.hex;
    return `${entity.displayName}'s color is now ${value.label}`;
  },
};

const sizeEditor: IPropertyEditor = {
  requiredComponent: 'transform',
  apply(entity, value) {
    const transform = entity.components.transform;
    if (value.kind !== 'scale' || !transform) return undefined;
    const next = value.mode === 'multiply' ? transform.scale * value.amount : value.amount;
    transform.scale = clamp(next, COMMAND_CONFIG.minScale, COMMAND_CONFIG.maxScale);
    return `${entity.displayName} is now ${value.label}`;
  },
};

const visibilityEditor: IPropertyEditor = {
  requiredComponent: 'render',
  apply(entity, value) {
    const render = entity.components.render;
    if (value.kind !== 'boolean' || !render) return undefined;
    render.visible = value.value;
    return `${entity.displayName} is now ${value.label}`;
  },
};

const positionEditor: IPropertyEditor = {
  requiredComponent: 'transform',
  apply(entity, value) {
    const transform = entity.components.transform;
    if (value.kind !== 'offset' || !transform) return undefined;
    const step = COMMAND_CONFIG.moveStepPixels;
    transform.x = clamp(transform.x + value.dx * step, 0, GAME_CONFIG.width);
    transform.y = clamp(transform.y + value.dy * step, 0, GAME_CONFIG.height);
    return `${entity.displayName} moved ${value.label}`;
  },
};

/** One editor per spoken property. A new property is one new entry here. */
export const PROPERTY_EDITORS: Readonly<Record<PropertyName, IPropertyEditor>> = {
  color: colorEditor,
  size: sizeEditor,
  visibility: visibilityEditor,
  position: positionEditor,
};
