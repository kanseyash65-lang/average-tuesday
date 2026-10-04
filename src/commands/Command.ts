import type { CommandSource } from './CommandSource';

export type CommandIntent = 'modify' | 'spawn' | 'destroy';
export type PropertyName = 'color' | 'size' | 'visibility' | 'position';

/** The new value a command wants, plus a short spoken-style label for feedback. */
export type CommandValue =
  | { readonly kind: 'color'; readonly hex: string; readonly label: string }
  | {
      readonly kind: 'scale';
      readonly mode: 'multiply' | 'set';
      readonly amount: number;
      readonly label: string;
    }
  | { readonly kind: 'boolean'; readonly value: boolean; readonly label: string }
  | { readonly kind: 'offset'; readonly dx: number; readonly dy: number; readonly label: string };

/** What the parser understood, before it is turned into a full Command. */
export interface IParsedRequest {
  readonly targetName: string;
  readonly property: PropertyName;
  readonly value: CommandValue;
}

/** A structured command, ready to validate and execute (see 04_COMMAND_ENGINE). */
export interface ICommand {
  readonly commandId: string;
  readonly intent: 'modify';
  readonly targetName: string;
  readonly property: PropertyName;
  readonly value: CommandValue;
  readonly source: CommandSource;
  readonly confidence: number;
}

/** A kind of thing the player can create, and how to say it. */
export interface ISpawnable {
  /** Matches the entityType of its definition, for example 'chicken'. */
  readonly entityType: string;
  readonly singularName: string;
  readonly pluralName: string;
}

/** What the parser understood from "spawn 5 chickens". */
export interface ISpawnRequest {
  readonly spawnable: ISpawnable;
  readonly quantity: number;
}

/** A structured spawn command, ready to validate and execute. */
export interface ISpawnCommand {
  readonly commandId: string;
  readonly intent: 'spawn';
  readonly spawnable: ISpawnable;
  readonly quantity: number;
  readonly source: CommandSource;
  readonly confidence: number;
}

/** How a spoken target word picks entities: by name, by tag, or all of them. */
export interface ITargetSelector {
  readonly kind: 'name' | 'tag' | 'all';
  /** The entity name or tag to match. Ignored for 'all'. */
  readonly value: string;
  readonly singularName: string;
  readonly pluralName: string;
}

/** What the parser understood from "delete all the chickens". */
export interface IDestroyRequest {
  readonly targetName: string;
}

/** A structured delete command, ready to validate and execute. */
export interface IDestroyCommand {
  readonly commandId: string;
  readonly intent: 'destroy';
  readonly targetName: string;
  readonly source: CommandSource;
  readonly confidence: number;
}
