import {
  addBuiltTree,
  BuiltTree,
  deserializeBuiltTrees,
  findBuiltTree,
  findEncompassingTree,
  makeBuiltTree,
  MAX_BUILT_TREES,
  pruneBuiltTree,
  serializeBuiltTrees,
  withoutPrunedTrees,
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

describe('serialization', () => {
  it('round-trips trees by their newick', () => {
    const trees = [
      makeBuiltTree(nwk('a', 'b', 'c')),
      makeBuiltTree(nwk('d', 'e', 'f')),
    ];
    const restored = deserializeBuiltTrees(serializeBuiltTrees(trees));
    expect(restored.map((t) => t.key)).toEqual(trees.map((t) => t.key));
  });

  it('tolerates missing or malformed data', () => {
    expect(deserializeBuiltTrees('{nope')).toEqual([]);
    expect(deserializeBuiltTrees('{"a":1}')).toEqual([]);
    expect(deserializeBuiltTrees('[1, null]')).toEqual([]);
  });
});

describe('findEncompassingTree', () => {
  const big = makeBuiltTree(nwk('a', 'b', 'c', 'd', 'e', 'f'));
  const small = makeBuiltTree(nwk('a', 'b', 'c', 'd'));

  it('picks the smallest tree that has every id, whichever is newer', () => {
    expect(findEncompassingTree([big, small], ['a', 'b'])).toBe(small);
    expect(findEncompassingTree([small, big], ['a', 'b'])).toBe(small);
  });

  it('skips a smaller tree that lacks an id', () => {
    expect(findEncompassingTree([big, small], ['a', 'e'])).toBe(big);
  });

  it('prefers the most recent of equally small trees', () => {
    const sameSize = makeBuiltTree(nwk('a', 'b', 'c', 'x'));
    expect(findEncompassingTree([small, sameSize], ['a', 'b'])).toBe(sameSize);
    expect(findEncompassingTree([sameSize, small], ['a', 'b'])).toBe(small);
  });

  it('is undefined when no tree has every id, or there are no ids', () => {
    expect(findEncompassingTree([big, small], ['a', 'z'])).toBeUndefined();
    expect(findEncompassingTree([big, small], [])).toBeUndefined();
  });
});

describe('pruneBuiltTree', () => {
  it('keeps only the requested leaves and the branch lengths', () => {
    const tree = makeBuiltTree('((a:1,b:2):3,(c:4,d:5):6);');
    const pruned = pruneBuiltTree(tree, ['a', 'b', 'c']);
    expect(pruned.leaves.map((l) => l.id).sort()).toEqual(['a', 'b', 'c']);
    expect(pruned.key).toBe(treeKey(['a', 'b', 'c']));
    expect(pruned.newick).toContain('a:1');
    expect(pruned.newick).not.toContain('d');
  });

  it('prunes a deep tree to exactly the wanted leaves, with no unlabeled stubs', () => {
    // a balanced binary tree: removing leaves leaves childless parents behind
    let nodes = Array.from({ length: 100 }, (_, i) => `g${i}:0.1`);
    while (nodes.length > 1) {
      nodes.push(`(${nodes.shift()},${nodes.shift()}):0.05`);
    }
    const tree = makeBuiltTree(`${nodes[0]};`);
    const keep = ['g3', 'g10', 'g20', 'g33', 'g50', 'g71', 'g99'];

    const pruned = pruneBuiltTree(tree, keep);

    expect(pruned.leaves.map((l) => l.id).sort()).toEqual([...keep].sort());
    expect(pruned.key).toBe(treeKey(keep));
  });

  it('does not change the tree it was given', () => {
    const tree = makeBuiltTree(nwk('a', 'b', 'c'));
    pruneBuiltTree(tree, ['a', 'b']);
    expect(tree.leaves.map((l) => l.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('pruned trees', () => {
  it('are marked as pruned, and built ones are not', () => {
    const built = makeBuiltTree(nwk('a', 'b', 'c', 'd'));
    expect(built.pruned).toBe(false);
    expect(pruneBuiltTree(built, ['a', 'b', 'c']).pruned).toBe(true);
  });

  it('keep their mark through serialization', () => {
    const built = makeBuiltTree(nwk('a', 'b', 'c', 'd'));
    const pruned = pruneBuiltTree(built, ['a', 'b', 'c']);
    const restored = deserializeBuiltTrees(
      serializeBuiltTrees([built, pruned])
    );
    expect(restored.map((t) => t.pruned)).toEqual([false, true]);
  });

  it('can be dropped, leaving the built trees', () => {
    const built = makeBuiltTree(nwk('a', 'b', 'c', 'd'));
    const pruned = pruneBuiltTree(built, ['a', 'b', 'c']);
    expect(withoutPrunedTrees([built, pruned])).toEqual([built]);
  });
});
