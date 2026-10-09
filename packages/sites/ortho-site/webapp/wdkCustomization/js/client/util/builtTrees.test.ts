import {
  addBuiltTree,
  BuiltTree,
  findBuiltTree,
  makeBuiltTree,
  MAX_BUILT_TREES,
  treeKey,
} from './builtTrees';

const nwk = (...ids: string[]) => `(${ids.map((id) => `${id}:1`).join(',')});`;

describe('treeKey', () => {
  it('ignores order', () => {
    expect(treeKey(['b', 'a', 'c'])).toBe(treeKey(['c', 'b', 'a']));
  });
  it('differs for different id sets', () => {
    expect(treeKey(['a', 'b'])).not.toBe(treeKey(['a', 'b', 'c']));
  });
});

describe('makeBuiltTree', () => {
  it('keys on the leaf ids', () => {
    const built = makeBuiltTree(nwk('a', 'b', 'c'));
    expect(built.key).toBe(treeKey(['a', 'b', 'c']));
    expect(built.leaves.map((l) => l.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('addBuiltTree', () => {
  it('replaces a tree for the same proteins instead of adding another', () => {
    const first = makeBuiltTree(nwk('a', 'b', 'c'));
    const again = makeBuiltTree(nwk('c', 'b', 'a'));
    expect(addBuiltTree([first], again)).toEqual([again]);
  });

  it('drops the oldest beyond the cap', () => {
    let trees: BuiltTree[] = [];
    const firstOne = makeBuiltTree(nwk('x0', 'y', 'z'));
    trees = addBuiltTree(trees, firstOne);
    for (let i = 1; i <= MAX_BUILT_TREES; i++) {
      trees = addBuiltTree(trees, makeBuiltTree(nwk(`x${i}`, 'y', 'z')));
    }
    expect(trees).toHaveLength(MAX_BUILT_TREES);
    expect(trees).not.toContain(firstOne);
  });
});

describe('findBuiltTree', () => {
  const all = makeBuiltTree(nwk('a', 'b', 'c', 'd'));
  const subset = makeBuiltTree(nwk('a', 'b', 'c'));
  const trees = [all, subset];

  it('finds the tree for exactly these proteins, in any order', () => {
    expect(findBuiltTree(trees, ['c', 'a', 'b'])).toBe(subset);
    expect(findBuiltTree(trees, ['d', 'c', 'b', 'a'])).toBe(all);
  });

  it('does not return a tree that merely contains the proteins', () => {
    expect(findBuiltTree(trees, ['a', 'b'])).toBeUndefined();
  });

  it('returns undefined for no proteins', () => {
    expect(findBuiltTree(trees, [])).toBeUndefined();
  });
});
