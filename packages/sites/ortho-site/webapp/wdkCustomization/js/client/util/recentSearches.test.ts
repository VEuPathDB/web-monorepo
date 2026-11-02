import { addRecentSearch, MAX_RECENT_SEARCHES } from './recentSearches';

describe('addRecentSearch', () => {
  it('puts the newest term first and de-duplicates', () => {
    expect(addRecentSearch(['b', 'aa', 'cc'], ' aa ')).toEqual([
      'aa',
      'b',
      'cc',
    ]);
  });

  it('ignores empty and one-character terms', () => {
    expect(addRecentSearch(['aa'], '  ')).toEqual(['aa']);
    expect(addRecentSearch(['aa'], 'x')).toEqual(['aa']);
  });

  it('keeps at most MAX_RECENT_SEARCHES, dropping the oldest', () => {
    const full = Array.from(
      { length: MAX_RECENT_SEARCHES },
      (_, i) => `term${i}`
    );
    const result = addRecentSearch(full, 'newest');
    expect(result).toHaveLength(MAX_RECENT_SEARCHES);
    expect(result[0]).toBe('newest');
    expect(result).not.toContain(`term${MAX_RECENT_SEARCHES - 1}`);
  });
});
