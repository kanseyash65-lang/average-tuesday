import type { CommandSource } from './CommandSource';

export type CommandIntent = 'modify';
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
  readonly intent: CommandIntent;
  readonly targetName: string;
  readonly property: PropertyName;
  readonly value: CommandValue;
  readonly source: CommandSource;
  readonly confidence: number;
}
