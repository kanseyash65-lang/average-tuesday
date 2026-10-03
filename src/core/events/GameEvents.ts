import type { EntityId } from '../../entities/base/Entity';
import type { IEventBus } from './IEventBus';

/** Every game event and its payload. Events describe facts that already happened. */
export interface IGameEventMap {
  // Temporary smoke-test event from Milestone 2. Removed when the real UI is built.
  readonly UIReady: { readonly readyAtMs: number };
  readonly EntitySpawned: { readonly entityId: EntityId; readonly entityType: string };
  readonly EntityDestroyed: { readonly entityId: EntityId; readonly entityType: string };
}

export type GameEventBus = IEventBus<IGameEventMap>;