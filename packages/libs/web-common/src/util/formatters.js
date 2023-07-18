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
export function formatReleaseDate(releaseDateString, format = 'dd mm yy') {
  const date = new Date(releaseDateString);
  return format
    .replace('dd', date.getDate())
    .replace('mm', MONTHS[date.getMonth()])
    .replace('yy', date.getFullYear());
}
