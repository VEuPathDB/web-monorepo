export const MAX_RECENT_SEARCHES = 10;
const MIN_TERM_LENGTH = 2;

/** `term` moved (or added) to the front, de-duplicated, capped. Too-short terms are ignored. */
export function addRecentSearch(recent: string[], term: string): string[] {
  const trimmed = term.trim();
  if (trimmed.length < MIN_TERM_LENGTH) return recent;
  return [trimmed, ...recent.filter((t) => t !== trimmed)].slice(
    0,
    MAX_RECENT_SEARCHES
  );
}
