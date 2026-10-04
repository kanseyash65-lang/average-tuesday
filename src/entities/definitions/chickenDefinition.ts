import { RENDER_LAYERS } from '../../core/constants/RenderLayers';
import type { IEntityDefinition } from './IEntityDefinition';

/** Position is a placeholder: the spawner places every chicken itself. */
export const CHICKEN_DEFINITION: IEntityDefinition = {
  entityType: 'chicken',
  name: 'chicken',
  displayName: 'Chicken',
  tags: ['animal', 'living'],
  components: {
    transform: { x: 0, y: 0, rotation: 0, scale: 1 },
    render: { tint: '#fff1c9', opacity: 1, visible: true, layer: RENDER_LAYERS.CREATURES },
  },
};
