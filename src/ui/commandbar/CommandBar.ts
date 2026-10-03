import type { CommandSource } from '../../commands/CommandSource';
import type { GameEventBus } from '../../core/events/GameEvents';
import type { ILogger } from '../../utils/logger/ILogger';
import { CommandInputController, type ICommandSubmission } from './CommandInputController';
import './command-bar.css';

export interface ICommandBarOptions {
  readonly pauseSubmitDelayMs: number;
  readonly maxRecentCommands: number;
  readonly placeholder: string;
  readonly inputLabel: string;
}

const SOURCE_ICONS: Readonly<Record<CommandSource, string>> = {
  voice: '🎙',
  text: '⌨',
};

/**
 * The player's front door: a text field that Wispr Flow dictates into.
 * It stays focused, submits dictated text after a pause, and announces
 * each command on the event bus. It contains no game logic.
 */
export class CommandBar {
  private readonly eventBus: GameEventBus;
  private readonly logger: ILogger;
  private readonly maxRecentCommands: number;
  private readonly abort = new AbortController();
  private readonly root: HTMLDivElement;
  private readonly recentList: HTMLUListElement;
  private readonly input: HTMLInputElement;
  private readonly controller: CommandInputController;

  constructor(
    parent: HTMLElement,
    eventBus: GameEventBus,
    logger: ILogger,
    options: ICommandBarOptions,
  ) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.maxRecentCommands = options.maxRecentCommands;

    this.recentList = document.createElement('ul');
    this.recentList.className = 'command-bar__recent';
    this.input = this.createInput(options);
    this.root = document.createElement('div');
    this.root.className = 'command-bar';
    this.root.append(this.recentList, this.input);
    parent.append(this.root);

    this.controller = new CommandInputController(
      (submission) => this.handleSubmission(submission),
      options.pauseSubmitDelayMs,
    );
    this.attachListeners();
    this.input.focus();
    this.logger.info('Command bar ready. Dictate with Wispr Flow, or type and press Enter.');
  }

  destroy(): void {
    this.controller.dispose();
    this.abort.abort();
    this.root.remove();
  }

  private createInput(options: ICommandBarOptions): HTMLInputElement {
    const input = document.createElement('input');
    input.className = 'command-bar__input';
    input.type = 'text';
    input.placeholder = options.placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('aria-label', options.inputLabel);
    return input;
  }

  private attachListeners(): void {
    const { signal } = this.abort;
    this.input.addEventListener('input', (event) => this.handleInput(event), { signal });
    this.input.addEventListener('keydown', (event) => this.handleKeyDown(event), { signal });
    this.input.addEventListener('blur', () => this.reclaimFocus(), { signal });
    window.addEventListener('focus', () => this.input.focus(), { signal });
  }

  private handleInput(event: Event): void {
    // Diagnostics: shows whether dictation arrives as one burst or key by key.
    const inputEvent = event as InputEvent;
    this.logger.debug(
      `Input event: ${inputEvent.inputType}, ${inputEvent.data?.length ?? 0} chars inserted at once.`,
    );
    this.controller.textChanged(this.input.value);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    this.controller.enterPressed(this.input.value);
  }

  private reclaimFocus(): void {
    // Dictation needs a focused text field, so take focus back
    // unless the player deliberately moved to another control.
    setTimeout(() => {
      if (document.activeElement === document.body) this.input.focus();
    }, 0);
  }

  private handleSubmission(submission: ICommandSubmission): void {
    this.input.value = '';
    this.addRecentCommand(submission);
    this.logger.info(`Command submitted (${submission.source}): ${submission.text}`);
    this.eventBus.emit('CommandSubmitted', submission);
  }

  private addRecentCommand(submission: ICommandSubmission): void {
    const item = document.createElement('li');
    item.className = 'command-bar__item';
    // textContent, never innerHTML: spoken text must not be able to inject markup.
    item.textContent = `${SOURCE_ICONS[submission.source]} ${submission.text}`;
    this.recentList.append(item);
    while (this.recentList.children.length > this.maxRecentCommands) {
      this.recentList.firstElementChild?.remove();
    }
  }
}
