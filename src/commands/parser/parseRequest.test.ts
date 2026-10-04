import { describe, expect, it } from 'vitest';
import { tokenize } from '../lexer/tokenize';
import { normalizeText } from '../normalizer/normalizeText';
import { COLOR_WORDS } from '../vocabulary/vocabulary';
import { parseRequest, type ParseResult } from './parseRequest';

function parse(spoken: string): ParseResult {
  return parseRequest(tokenize(normalizeText(spoken).text));
}

describe('parseRequest', () => {
  it('understands a color change in several phrasings', () => {
    const expected = {
      ok: true,
      request: {
        targetName: 'sun',
        property: 'color',
        value: { kind: 'color', hex: COLOR_WORDS.green, label: 'green' },
      },
    };
    expect(parse('Turn the sun green')).toEqual(expected);
    expect(parse('make the sun green')).toEqual(expected);
    expect(parse('Paint the sun green please')).toEqual(expected);
  });

  it('understands relative and absolute sizes', () => {
    expect(parse('make the sun bigger')).toMatchObject({
      ok: true,
      request: { property: 'size', value: { kind: 'scale', mode: 'multiply', amount: 1.5 } },
    });
    expect(parse('make the sun huge')).toMatchObject({
      ok: true,
      request: { property: 'size', value: { kind: 'scale', mode: 'set', amount: 3 } },
    });
  });

  it('understands hiding and showing', () => {
    expect(parse('hide the sun')).toMatchObject({
      ok: true,
      request: { property: 'visibility', value: { kind: 'boolean', value: false } },
    });
    expect(parse('show the sun')).toMatchObject({
      ok: true,
      request: { property: 'visibility', value: { kind: 'boolean', value: true } },
    });
  });

  it('understands moving in a direction', () => {
    expect(parse('move the sun left')).toMatchObject({
      ok: true,
      request: { property: 'position', value: { kind: 'offset', dx: -1, dy: 0 } },
    });
  });

  it('survives a dictation mishearing', () => {
    expect(parse('Turn this on green.')).toMatchObject({
      ok: true,
      request: { targetName: 'sun', property: 'color' },
    });
  });

  it('asks which object when none is named', () => {
    const result = parse('make it green');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("couldn't find that object");
  });

  it('asks what to do when only the object is named', () => {
    const result = parse('turn the sun');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('What should happen to the sun');
  });

  it('ignores words that happen to be built-in object property names', () => {
    expect(parse('make the sun constructor').ok).toBe(false);
  });
});
