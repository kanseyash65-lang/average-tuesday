import { PHRASE_CORRECTIONS, SPELLING_VARIANTS } from '../vocabulary/vocabulary';

export interface INormalizedText {
  readonly text: string;
  /** How many likely mishearings were fixed. Used to lower the command's confidence. */
  readonly correctionsApplied: number;
}

type PhraseTable = ReadonlyArray<readonly [string, string]>;

function replacePhrases(text: string, table: PhraseTable): INormalizedText {
  let current = ` ${text} `;
  let applied = 0;
  for (const [heard, meant] of table) {
    const pattern = ` ${heard} `;
    if (!current.includes(pattern)) continue;
    current = current.replaceAll(pattern, ` ${meant} `);
    applied += 1;
  }
  return { text: current.trim(), correctionsApplied: applied };
}

/** Turns whatever was dictated into one consistent, lower-case form. */
export function normalizeText(raw: string): INormalizedText {
  const cleaned = raw
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const spelled = replacePhrases(cleaned, SPELLING_VARIANTS);
  return replacePhrases(spelled.text, PHRASE_CORRECTIONS);
}
