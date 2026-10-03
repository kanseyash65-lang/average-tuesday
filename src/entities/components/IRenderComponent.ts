/** How an entity looks. Data only; the renderer reads it and never writes it. */
export interface IRenderComponent {
  /** Hex color string such as '#ffd54a'. */
  tint: string;
  opacity: number;
  visible: boolean;
  /** One of RENDER_LAYERS. */
  layer: number;
}