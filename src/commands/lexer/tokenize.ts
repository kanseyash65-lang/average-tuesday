/** Splits normalized text into words. */
export function tokenize(normalizedText: string): string[] {
  return normalizedText.split(' ').filter((word) => word !== '');
}
