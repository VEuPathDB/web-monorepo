import {
  GEOHASH_BASE32,
  addPrefixes,
  classifyMarkers,
  geohashBounds,
  geohashToShape,
  intersectPrefixSets,
  isCovered,
  isPartiallyCovered,
  normalizePrefixes,
  prefixSetsEqual,
  removePrefix,
  removePrefixes,
} from './geohashSelection';

describe('normalizePrefixes', () => {
  it('drops duplicates and prefixes covered by shorter ones', () => {
    expect(normalizePrefixes(['u4pr', 'u4', 'u4', 'gc', 'u4x'])).toEqual([
      'gc',
      'u4',
    ]);
  });

  it('merges a complete set of siblings into the parent', () => {
    const children = GEOHASH_BASE32.split('').map((c) => 'u4' + c);
    expect(normalizePrefixes(children)).toEqual(['u4']);
  });

  it('merges recursively', () => {
    const grandchildren = GEOHASH_BASE32.split('').flatMap((c) =>
      c === '0' ? GEOHASH_BASE32.split('').map((d) => 'u' + c + d) : ['u' + c]
    );
    expect(normalizePrefixes(grandchildren)).toEqual(['u']);
  });

  it('treats the empty prefix as the whole world', () => {
    expect(normalizePrefixes(['', 'u4'])).toEqual(['']);
  });
});

describe('coverage', () => {
  it('identifies fully and partially covered cells', () => {
    const selection = ['u4p', 'gcp'];
    expect(isCovered('u4pr', selection)).toBe(true);
    expect(isCovered('u4p', selection)).toBe(true);
    expect(isCovered('u4', selection)).toBe(false);
    expect(isPartiallyCovered('u4', selection)).toBe(true);
    expect(isPartiallyCovered('u4pr', selection)).toBe(false);
    expect(isPartiallyCovered('dr', selection)).toBe(false);
  });

  it('classifies marker ids', () => {
    expect(
      classifyMarkers(['u4', 'gcpv', 'gcpu', 'dr'], ['u4p', 'gcp'])
    ).toEqual({ selected: ['gcpv', 'gcpu'], partiallySelected: ['u4'] });
  });
});

describe('addPrefixes / removePrefix', () => {
  it('adds', () => {
    expect(addPrefixes(['u4p'], ['u4', 'gc'])).toEqual(['gc', 'u4']);
  });

  it('removes finer prefixes inside the removed cell', () => {
    expect(removePrefix(['u4pr', 'u4px', 'gc'], 'u4p')).toEqual(['gc']);
  });

  it('splits a coarser prefix that contains the removed cell', () => {
    const result = removePrefix(['u4'], 'u4pr');
    // 31 siblings of 'p' under 'u4' and 31 siblings of 'r' under 'u4p'
    expect(result).toHaveLength(62);
    expect(isCovered('u4pr', result)).toBe(false);
    expect(isCovered('u4prz', result)).toBe(false);
    expect(isCovered('u4px', result)).toBe(true);
    expect(isCovered('u4z', result)).toBe(true);
    // removing then re-adding gives back the original area
    expect(prefixSetsEqual(addPrefixes(result, ['u4pr']), ['u4'])).toBe(true);
  });

  it('removes several cells', () => {
    expect(removePrefixes(['a', 'b', 'c'], ['a', 'c'])).toEqual(['b']);
  });

  it('ignores cells that are not selected', () => {
    expect(removePrefix(['u4'], 'gc')).toEqual(['u4']);
  });
});

describe('intersectPrefixSets', () => {
  it('keeps the finer prefix of nested pairs', () => {
    expect(intersectPrefixSets(['u4', 'gc'], ['u4pr', 'dr'])).toEqual(['u4pr']);
  });

  it('is empty for disjoint areas', () => {
    expect(intersectPrefixSets(['u4'], ['gc'])).toEqual([]);
  });
});

describe('geohashBounds', () => {
  it('decodes a known geohash', () => {
    // 'u4pruydqqvj' is the classic example near Jutland (57.649, 10.407)
    const { south, west, north, east } = geohashBounds('u4pruydqqvj');
    expect((south + north) / 2).toBeCloseTo(57.64911, 4);
    expect((west + east) / 2).toBeCloseTo(10.40744, 4);
  });

  it('the empty geohash is the whole world', () => {
    expect(geohashBounds('')).toEqual({
      south: -90,
      west: -180,
      north: 90,
      east: 180,
    });
  });

  it('makes a closed rectangle ring', () => {
    expect(geohashToShape('s')).toEqual([
      [0, 0],
      [45, 0],
      [45, 45],
      [0, 45],
    ]);
  });
});
