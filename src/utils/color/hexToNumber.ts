const HEX_COLOR_PATTERN = /^#([0-9a-f]{6})$/i;

/** Converts '#rrggbb' to a number such as 0xffd54a. Returns undefined for anything else. */
export function hexToNumber(hex: string): number | undefined {
  const digits = HEX_COLOR_PATTERN.exec(hex)?.[1];
  if (digits === undefined) return undefined;
  return Number.parseInt(digits, 16);
}
