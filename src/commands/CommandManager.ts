import { COMMAND_CONFIG } from '../core/config/commandConfig';
import type { GameEventBus, IGameEventMap } from '../core/events/GameEvents';
import type { Unsubscribe } from '../core/events/IEventBus';
import type { IEntity } from '../entities/base/Entity';
import type { IEntityManager } from '../entities/registry/IEntityManager';
import type { ILogger } from '../utils/logger/ILogger';
import type { CommandSource } from './CommandSource';
import type { ICommand, IParsedRequest } from './Command';
import { executeCommand } from './executor/executeCommand';
import { tokenize } from './lexer/tokenize';
import { normalizeText } from './normalizer/normalizeText';
import { parseRequest } from './parser/parseRequest';
import { resolveTargets } from './resolver/resolveTargets';
import { validateCommand } from './validators/validateCommand';

type SubmittedCommand = IGameEventMap['CommandSubmitted'];

/**
 * Runs every submitted command through the pipeline:
 * normalize -> tokenize -> parse -> resolve targets -> validate -> execute.
 * Commands run one at a time, in the order the event bus delivers them.
 */
export class CommandManager {
  private readonly eventBus: GameEventBus;
  private readonly entityManager: IEntityManager;
  private readonly logger: ILogger;
  private readonly subscriptions: Unsubscribe[] = [];
  private commandCounter = 0;

  constructor(eventBus: GameEventBus, entityManager: IEntityManager, logger: ILogger) {
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.logger = logger;
  }

  start(): void {
    this.subscriptions.push(
      this.eventBus.on('CommandSubmitted', (submitted) => this.handle(submitted)),
    );
  }

  destroy(): void {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.length = 0;
  }

  private handle(submitted: SubmittedCommand): void {
    const normalized = normalizeText(submitted.text);
    const parsed = parseRequest(tokenize(normalized.text));
    if (!parsed.ok) {
      this.reject(submitted.text, parsed.reason);
      return;
    }
    const command = this.buildCommand(parsed.request, submitted.source, normalized.correctionsApplied);
    const targets = resolveTargets(this.entityManager, command.targetName);
    const problem = validateCommand(command, targets);
    if (problem !== undefined) {
      this.reject(submitted.text, problem);
      return;
    }
    this.execute(command, targets, submitted.text, normalized.text);
  }

  private execute(
    command: ICommand,
    targets: readonly IEntity[],
    spokenText: string,
    understoodAs: string,
  ): void {
    const results = executeCommand(command, targets);
    if (results.length === 0) {
      this.reject(spokenText, `I couldn't apply that to the ${command.targetName}.`);
      return;
    }
    for (const { entity } of results) {
      this.eventBus.emit('EntityPropertyChanged', {
        entityId: entity.id,
        property: command.property,
        commandId: command.commandId,
      });
    }
    const summary = results.map((result) => result.summary).join('. ');
    this.logger.info(`"${spokenText}" understood as "${understoodAs}": ${summary}`, {
      commandId: command.commandId,
    });
    this.eventBus.emit('CommandExecuted', {
      commandId: command.commandId,
      text: spokenText,
      summary,
    });
  }

  private reject(text: string, reason: string): void {
    this.logger.warning(`Command rejected ("${text}"): ${reason}`);
    this.eventBus.emit('CommandRejected', { text, reason });
  }

  private buildCommand(
    request: IParsedRequest,
    source: CommandSource,
    correctionsApplied: number,
  ): ICommand {
    this.commandCounter += 1;
    return {
      commandId: `cmd_${String(this.commandCounter).padStart(COMMAND_CONFIG.idDigits, '0')}`,
      intent: 'modify',
      targetName: request.targetName,
      property: request.property,
      value: request.value,
      source,
      confidence:
        correctionsApplied > 0 ? COMMAND_CONFIG.correctedConfidence : COMMAND_CONFIG.exactConfidence,
    };
  }
}
