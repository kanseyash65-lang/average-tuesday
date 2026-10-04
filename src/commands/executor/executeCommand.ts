import type { IEntity } from '../../entities/base/Entity';
import type { ICommand } from '../Command';
import { PROPERTY_EDITORS } from './propertyEditors';

export interface IExecutionResult {
  readonly entity: IEntity;
  readonly summary: string;
}

/** Applies a validated command to its targets. Never parses language. */
export function executeCommand(
  command: ICommand,
  targets: readonly IEntity[],
): IExecutionResult[] {
  const editor = PROPERTY_EDITORS[command.property];
  const results: IExecutionResult[] = [];
  for (const entity of targets) {
    const summary = editor.apply(entity, command.value);
    if (summary !== undefined) results.push({ entity, summary });
  }
  return results;
}
