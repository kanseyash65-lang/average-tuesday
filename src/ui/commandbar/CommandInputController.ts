import type { CommandSource } from '../../commands/CommandSource';

export interface ICommandSubmission {
  readonly text: string;
  readonly source: CommandSource;
}

type SubmitHandler = (submission: ICommandSubmission) => void;

/**
 * Decides when text becomes a command.
 * - Text that stops changing for pauseDelayMs is submitted as 'voice' (dictation path).
 * - Enter submits immediately as 'text' (keyboard fallback).
 * Contains no DOM code so it can be unit-tested.
 */
export class CommandInputController {
  private readonly onSubmit: SubmitHandler;
  private readonly pauseDelayMs: number;
  private pauseTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(onSubmit: SubmitHandler, pauseDelayMs: number) {
    this.onSubmit = onSubmit;
    this.pauseDelayMs = pauseDelayMs;
  }

  textChanged(text: string): void {
    this.cancelPendingSubmit();
    if (text.trim() === '') return;
    this.pauseTimer = setTimeout(() => this.submit(text, 'voice'), this.pauseDelayMs);
  }

  enterPressed(text: string): void {
    this.cancelPendingSubmit();
    this.submit(text, 'text');
  }

  dispose(): void {
    this.cancelPendingSubmit();
  }

  private submit(text: string, source: CommandSource): void {
    const trimmed = text.trim();
    if (trimmed === '') return;
    this.pauseTimer = undefined;
    this.onSubmit({ text: trimmed, source });
  }

  private cancelPendingSubmit(): void {
    if (this.pauseTimer === undefined) return;
    clearTimeout(this.pauseTimer);
    this.pauseTimer = undefined;
  }
}
