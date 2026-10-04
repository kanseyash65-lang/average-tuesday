import { COMMAND_CONFIG } from '../core/config/commandConfig';
import type { GameEventBus, IGameEventMap } from '../core/events/GameEvents';
import type { Unsubscribe } from '../core/events/IEventBus';
import type { IEntity } from '../entities/base/Entity';
import type { IEntitySpawner } from '../entities/factory/IEntitySpawner';
import type { IEntityManager } from '../entities/registry/IEntityManager';
import type { ILogger } from '../utils/logger/ILogger';
import type { CommandSource } from './CommandSource';
import type {
  ICommand,
  IDestroyCommand,
  IDestroyRequest,
  IParsedRequest,
  ISpawnCommand,
  ISpawnRequest,
} from './Command';
import { describeChange } from './executor/describeChange';
import { describeDestroy } from './executor/describeDestroy';
import { describeSpawn } from './executor/describeSpawn';
import { executeCommand } from './executor/executeCommand';
import { executeDestroy } from './executor/executeDestroy';
import { tokenize } from './lexer/tokenize';
import { normalizeText } from './normalizer/normalizeText';
import { parseCommand } from './parser/parseCommand';
import { resolveTargets } from './resolver/resolveTargets';
import { validateCommand } from './validators/validateCommand';
import { validateDestroyCommand } from './validators/validateDestroyCommand';
import { validateSpawnCommand } from './validators/validateSpawnCommand';

type SubmittedCommand = IGameEventMap['CommandSubmitted'];

/** What every command carries along, whatever kind it is. */
interface IHandlingContext {
  readonly spokenText: string;
  readonly understoodAs: string;
  readonly source: CommandSource;
  readonly confidence: number;
}

/**
 * Runs every submitted command through the pipeline:
 * normalize -> tokenize -> parse -> (resolve targets ->) validate -> execute.
 * Commands run one at a time, in the order the event bus delivers them.
 */
export class CommandManager {
  private readonly eventBus: GameEventBus;
  private readonly entityManager: IEntityManager;
  private readonly spawner: IEntitySpawner;
  private readonly logger: ILogger;
  private readonly subscriptions: Unsubscribe[] = [];
  private commandCounter = 0;

  constructor(
    eventBus: GameEventBus,
    entityManager: IEntityManager,
    spawner: IEntitySpawner,
    logger: ILogger,
  ) {
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.spawner = spawner;
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
    const parsed = parseCommand(tokenize(normalized.text));
    if (!parsed.ok) {
      this.reject(submitted.text, parsed.reason);
      return;
    }
    const context: IHandlingContext = {
      spokenText: submitted.text,
      understoodAs: normalized.text,
      source: submitted.source,
      confidence:
        normalized.correctionsApplied > 0
          ? COMMAND_CONFIG.correctedConfidence
          : COMMAND_CONFIG.exactConfidence,
    };
    if (parsed.kind === 'spawn') this.handleSpawn(parsed.request, context);
    else if (parsed.kind === 'destroy') this.handleDestroy(parsed.request, context);
    else this.handleModify(parsed.request, context);
  }

  private handleModify(request: IParsedRequest, context: IHandlingContext): void {
    const command: ICommand = {
      commandId: this.nextCommandId(),
      intent: 'modify',
      targetName: request.targetName,
      property: request.property,
      value: request.value,
      source: context.source,
      confidence: context.confidence,
    };
    const targets = resolveTargets(this.entityManager, command.targetName);
    const problem = validateCommand(command, targets);
    if (problem !== undefined) {
      this.reject(context.spokenText, problem);
      return;
    }
    this.executeModify(command, targets, context);
  }

  private executeModify(
    command: ICommand,
    targets: readonly IEntity[],
    context: IHandlingContext,
  ): void {
    const results = executeCommand(command, targets);
    if (results.length === 0) {
      this.reject(context.spokenText, `I couldn't apply that to the ${command.targetName}.`);
      return;
    }
    for (const { entity } of results) {
      this.eventBus.emit('EntityPropertyChanged', {
        entityId: entity.id,
        property: command.property,
        commandId: command.commandId,
      });
    }
    this.complete(command.commandId, describeChange(command, results), context);
  }

  private handleDestroy(request: IDestroyRequest, context: IHandlingContext): void {
    const command: IDestroyCommand = {
      commandId: this.nextCommandId(),
      intent: 'destroy',
      targetName: request.targetName,
      source: context.source,
      confidence: context.confidence,
    };
    const protectedTags = COMMAND_CONFIG.protectedFromDeletionTags;
    const targets = resolveTargets(this.entityManager, command.targetName);
    const problem = validateDestroyCommand(command, targets, protectedTags);
    if (problem !== undefined) {
      this.reject(context.spokenText, problem);
      return;
    }
    const outcome = executeDestroy(this.entityManager, targets, protectedTags);
    this.eventBus.emit('EntitiesDestroyed', {
      commandId: command.commandId,
      targetName: command.targetName,
      destroyed: outcome.destroyed,
    });
    this.complete(command.commandId, describeDestroy(command.targetName, outcome), context);
  }

  private handleSpawn(request: ISpawnRequest, context: IHandlingContext): void {
    const command: ISpawnCommand = {
      commandId: this.nextCommandId(),
      intent: 'spawn',
      spawnable: request.spawnable,
      quantity: request.quantity,
      source: context.source,
      confidence: context.confidence,
    };
    const problem = validateSpawnCommand(command);
    if (problem !== undefined) {
      this.reject(context.spokenText, problem);
      return;
    }
    this.executeSpawn(command, context);
  }

  private executeSpawn(command: ISpawnCommand, context: IHandlingContext): void {
    const { entityType, pluralName } = command.spawnable;
    const outcome = this.spawner.spawn(entityType, command.quantity);
    if (outcome === undefined) {
      this.reject(context.spokenText, `I don't know how to create ${pluralName} yet.`);
      return;
    }
    if (outcome.spawned === 0) {
      this.reject(context.spokenText, `The world is full. There is no room for more ${pluralName}.`);
      return;
    }
    this.eventBus.emit('EntitiesSpawned', {
      commandId: command.commandId,
      entityType,
      requested: outcome.requested,
      spawned: outcome.spawned,
    });
    this.complete(command.commandId, describeSpawn(command.spawnable, outcome), context);
  }

  private complete(commandId: string, summary: string, context: IHandlingContext): void {
    this.logger.info(`"${context.spokenText}" understood as "${context.understoodAs}": ${summary}`, {
      commandId,
    });
    this.eventBus.emit('CommandExecuted', { commandId, text: context.spokenText, summary });
  }

  private reject(text: string, reason: string): void {
    this.logger.warning(`Command rejected ("${text}"): ${reason}`);
    this.eventBus.emit('CommandRejected', { text, reason });
  }

  private nextCommandId(): string {
    this.commandCounter += 1;
    return `cmd_${String(this.commandCounter).padStart(COMMAND_CONFIG.idDigits, '0')}`;
  }
}
