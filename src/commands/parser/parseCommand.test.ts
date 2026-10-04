import { describe, expect, it } from 'vitest';
import { tokenize } from '../lexer/tokenize';
import { normalizeText } from '../normalizer/normalizeText';
import { parseCommand, type ParsedCommand } from './parseCommand';

function parse(spoken: string): ParsedCommand {
  return parseCommand(tokenize(normalizeText(spoken).text));
}

describe('parseCommand', () => {
  it('understands spawn in several phrasings', () => {
    const expected = {
      ok: true,
      kind: 'spawn',
      request: { spawnable: { entityType: 'chicken' }, quantity: 5 },
    };
    expect(parse('Spawn 5 chickens')).toMatchObject(expected);
    expect(parse('summon five chickens please')).toMatchObject(expected);
    expect(parse('Create 5 hens.')).toMatchObject(expected);
  });

  it('spawns one when no amount is said', () => {
    expect(parse('spawn a chicken')).toMatchObject({
      ok: true,
      kind: 'spawn',
      request: { quantity: 1 },
    });
  });

  it('still hands ordinary changes to the modify parser', () => {
    expect(parse('turn the sun green')).toMatchObject({
      ok: true,
      kind: 'modify',
      request: { targetName: 'sun', property: 'color' },
    });
  });

  it('treats a create-word as a change when nothing creatable was named', () => {
    expect(parse('add some green to the sun')).toMatchObject({
      ok: true,
      kind: 'modify',
      request: { targetName: 'sun', property: 'color' },
    });
  });

  it('explains what it cannot create', () => {
    const result = parse('spawn 5 dragons');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("don't know how to create that");
  });

  it('does not spawn without a create-word', () => {
    expect(parse('five chickens').ok).toBe(false);
  });

  it('ignores words that happen to be built-in object property names', () => {
    expect(parse('spawn 5 constructor').ok).toBe(false);
  });
});
