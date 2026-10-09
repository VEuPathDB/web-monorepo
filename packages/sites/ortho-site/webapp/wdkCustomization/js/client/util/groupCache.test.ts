import {
  discardStaleGroupCache,
  groupCacheKey,
  MAX_TOTAL_CHARS,
} from './groupCache';

const storage = window.sessionStorage;

describe('discardStaleGroupCache', () => {
  beforeEach(() => storage.clear());

  it('keeps cached state while the service version is unchanged', () => {
    discardStaleGroupCache(1, 'OG1');
    storage.setItem(groupCacheKey('OG1', 'trees'), '["x"]');
    discardStaleGroupCache(1, 'OG1');
    expect(storage.getItem(groupCacheKey('OG1', 'trees'))).toBe('["x"]');
  });

  it('discards every group when the service version changes', () => {
    discardStaleGroupCache(1, 'OG1');
    storage.setItem(groupCacheKey('OG1', 'trees'), 'a');
    storage.setItem(groupCacheKey('OG2', 'trees'), 'b');
    storage.setItem('unrelated', 'keep');
    discardStaleGroupCache(2, 'OG1');
    expect(storage.getItem(groupCacheKey('OG1', 'trees'))).toBeNull();
    expect(storage.getItem(groupCacheKey('OG2', 'trees'))).toBeNull();
    expect(storage.getItem('unrelated')).toBe('keep');
  });

  it("over budget, drops other groups' state but keeps the current group's", () => {
    discardStaleGroupCache(1, 'OG1');
    storage.setItem(groupCacheKey('OG1', 'trees'), 'x'.repeat(10));
    storage.setItem(groupCacheKey('OG2', 'trees'), 'x'.repeat(MAX_TOTAL_CHARS));
    discardStaleGroupCache(1, 'OG1');
    expect(storage.getItem(groupCacheKey('OG2', 'trees'))).toBeNull();
    expect(storage.getItem(groupCacheKey('OG1', 'trees'))).toBe('x'.repeat(10));
  });

  it('does not throw when storage fails', () => {
    const failing = {
      length: 0,
      key: () => null,
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => undefined,
    } as unknown as Storage;
    expect(() => discardStaleGroupCache(1, 'OG1', failing)).not.toThrow();
  });
});
