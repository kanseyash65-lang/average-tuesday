/** How one entity type is drawn. Placeholder shapes until real art assets arrive. */
export interface IViewStyle {
  /** Circle radius in world pixels at scale 1. */
  readonly baseRadius: number;
}

export interface IRenderConfig {
  /** Shown when an entity's tint is not a valid '#rrggbb' color (magenta is easy to spot). */
  readonly fallbackColor: number;
  readonly haloScale: number;
  readonly haloAlpha: number;
  readonly defaultStyle: IViewStyle;
  readonly styles: Readonly<Record<string, IViewStyle>>;
}

export const RENDER_CONFIG: IRenderConfig = {
  fallbackColor: 0xff00ff,
  haloScale: 1.7,
  haloAlpha: 0.25,
  defaultStyle: { baseRadius: 24 },
  styles: {
    sun: { baseRadius: 56 },
    chicken: { baseRadius: 10 },
  },
};
