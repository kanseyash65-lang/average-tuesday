import { describe, expect, it } from 'vitest';
import type { IEntity } from '../../entities/base/Entity';
import type { ICommand } from '../Command';
import { describeChange } from './describeChange';

const ENTITY = {} as IEntity;

function command(targetName: string, property: ICommand['property'], label: string): ICommand {
  const value = { kind: 'boolean', value: true, label } as const;
  return { commandId: 'cmd_000001', intent: 'modify', targetName, property, value, source: 'voice', confidence: 1 };
}

describe('describeChange', () => {
  it('keeps the sentence of a single thing', () => {
    const results = [{ entity: ENTITY, summary: "The Sun's color is now green" }];
    expect(describeChange(command('sun', 'color', 'green'), results)).toBe("The Sun's color is now green");
  });

  it('counts a group', () => {
    const results = [1, 2, 3].map(() => ({ entity: ENTITY, summary: 'x' }));
    expect(describeChange(command('chicken', 'color', 'blue'), results)).toBe('3 chickens are now blue');
  });

  it('says moved for position', () => {
    const results = [1, 2].map(() => ({ entity: ENTITY, summary: 'x' }));
    expect(describeChange(command('animal', 'position', 'left'), results)).toBe('2 animals moved left');
  });
});
