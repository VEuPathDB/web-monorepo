/**
 * Format a list of items with proper grammar and Oxford comma
 * @param items - Array of items to format
 * @param conjunction - Either "and" or "or" (default: "and")
 * @returns Formatted list with Oxford comma
 * @example
 * formatList(['A', 'B', 'C'], 'and') => "A, B, and C"
 * formatList(['A', 'B'], 'or') => "A or B"
 */
export function formatList(
  items: readonly string[],
  conjunction: 'and' | 'or' = 'and'
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}
