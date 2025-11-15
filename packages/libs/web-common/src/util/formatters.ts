export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * format release date string
 */
export function formatReleaseDate(
  releaseDateString: string,
  format: string = 'dd mm yy'
): string {
  const date = new Date(releaseDateString);
  return format
    .replace('dd', String(date.getDate()))
    .replace('mm', MONTHS[date.getMonth()])
    .replace('yy', String(date.getFullYear()));
}

/**
 * Format a list of items with proper grammar and Oxford comma
 * @example
 * formatList(['A', 'B', 'C'], 'and') => "A, B, and C"
 * formatList(['A', 'B'], 'or') => "A or B"
 */
export function formatList(
  items: string[],
  conjunction: string = 'and'
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}
