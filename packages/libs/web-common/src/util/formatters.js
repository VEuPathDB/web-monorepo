export const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];

/**
 * format release date string
 */
export function formatReleaseDate(releaseDateString, format) {
  const date = new Date(releaseDateString);
  return (typeof format === 'string' ? format : 'dd mm yy')
    .replace('dd', date.getDate())
    .replace('mm', MONTHS[date.getMonth()])
    .replace('yy', date.getFullYear());
}
