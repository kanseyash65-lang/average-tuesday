import { RENDER_LAYERS } from '../../core/constants/RenderLayers';
import type { IEntityDefinition } from './IEntityDefinition';

export const SUN_DEFINITION: IEntityDefinition = {
  entityType: 'sun',
  name: 'sun',
  displayName: 'The Sun',
  tags: ['celestial'],
  components: {
    transform: { x: 640, y: 120, rotation: 0, scale: 1 },
    render: { tint: '#ffd54a', opacity: 1, visible: true, layer: RENDER_LAYERS.CELESTIAL },
  },
};