import type { IEventBus } from './IEventBus';

/** Every game event and its payload. Events describe facts that already happened. */
export interface IGameEventMap {
  // Temporary smoke-test event for Milestone 2. Replaced by real events later.
  readonly UIReady: { readonly readyAtMs: number };
}

export type GameEventBus = IEventBus<IGameEventMap>;