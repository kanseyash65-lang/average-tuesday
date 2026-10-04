import type { CommandSource } from '../../commands/CommandSource';
import type { EntityId } from '../../entities/base/Entity';
import type { IEventBus } from './IEventBus';

/** Every game event and its payload. Events describe facts that already happened. */
export interface IGameEventMap {
  // Temporary smoke-test event from Milestone 2. Removed when the real UI is built.
  readonly UIReady: { readonly readyAtMs: number };
  readonly EntitySpawned: { readonly entityId: EntityId; readonly entityType: string };
  readonly EntityDestroyed: { readonly entityId: EntityId; readonly entityType: string };
  /** The player submitted a command, by voice (dictation) or by keyboard. */
  readonly CommandSubmitted: { readonly text: string; readonly source: CommandSource };
  /** A command was understood and has changed the world. */
  readonly CommandExecuted: {
    readonly commandId: string;
    readonly text: string;
    readonly summary: string;
  };
  /** A command could not run. The reason is written for the player to read. */
  readonly CommandRejected: { readonly text: string; readonly reason: string };
  /** A command changed one property of one entity. Lets other systems react. */
  readonly EntityPropertyChanged: {
    readonly entityId: EntityId;
    readonly property: string;
    readonly commandId: string;
  };
}

export type GameEventBus = IEventBus<IGameEventMap>;
