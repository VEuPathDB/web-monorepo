import { Branch, parseNewick } from 'patristic';

export const MAX_BUILT_TREES = 5;

export interface BuiltTree {
  /** Identifies the set of proteins the tree covers, not the filter that selected them. */
  key: string;
  newick: string;
  leaves: Branch[];
  /** The leaf ids again, for quick membership checks. */
  leafIds: Set<string>;
  /** Derived by pruning a larger tree, not built by a job. */
  pruned: boolean;
}

// The ids are joined, not hashed: with at most ~1000 ids per tree that is
// small, can't collide, and avoids the async crypto API.
export function treeKey(ids: Iterable<string>): string {
  return Array.from(ids).sort().join('\n');
}

export function makeBuiltTree(newick: string, pruned = false): BuiltTree {
  const leaves = parseNewick(newick).getLeaves();
  const ids = leaves.map((leaf) => leaf.id);
  return { key: treeKey(ids), newick, leaves, leafIds: new Set(ids), pruned };
}

/** Appends `built`, replacing any tree for the same proteins and dropping the oldest beyond the cap. */
export function addBuiltTree(
  trees: BuiltTree[],
  built: BuiltTree
): BuiltTree[] {
  return [...trees.filter((t) => t.key !== built.key), built].slice(
    -MAX_BUILT_TREES
  );
}

/**
 * The tree built for exactly these proteins. A tree is never pruned to fit a
 * subset; a new set of proteins gets a new tree.
 */
export function findBuiltTree(
  trees: BuiltTree[],
  ids: Iterable<string>
): BuiltTree | undefined {
  const key = treeKey(ids);
  return key === '' ? undefined : trees.find((t) => t.key === key);
}

/**
 * The smallest stored tree that has a leaf for every one of `ids` (the most
 * recently built, among equally small ones), if any. Only for when the user
 * allows pruning; `findBuiltTree` is the exact match.
 */
export function findEncompassingTree(
  trees: BuiltTree[],
  ids: Iterable<string>
): BuiltTree | undefined {
  const wanted = Array.from(new Set(ids));
  if (wanted.length === 0) return undefined;
  // `trees` is oldest first (see addBuiltTree); the sort is stable, so
  // reversing first puts the newest first among equal sizes
  return [...trees]
    .reverse()
    .filter((t) => t.leafIds.size >= wanted.length)
    .sort((a, b) => a.leafIds.size - b.leafIds.size)
    .find((t) => wanted.every((id) => t.leafIds.has(id)));
}

/** `tree` reduced to the leaves in `ids`, keeping its branch lengths. */
export function pruneBuiltTree(
  tree: BuiltTree,
  ids: Iterable<string>
): BuiltTree {
  const keep = new Set(ids);
  const root = parseNewick(tree.newick);
  // Removing a leaf can leave its parent childless, which then becomes a
  // leaf without an id; go again until only the wanted leaves remain.
  let removed: boolean;
  do {
    removed = false;
    for (const leaf of root.getLeaves()) {
      if (!keep.has(leaf.id)) {
        leaf.remove(true); // also removes ancestors left childless
        removed = true;
      }
    }
  } while (removed);
  return makeBuiltTree(root.toNewick(), true);
}

/** Built trees are stored as their newick; pruned ones are marked. */
export function serializeBuiltTrees(trees: BuiltTree[]): string {
  return JSON.stringify(
    trees.map((t) => (t.pruned ? { newick: t.newick, pruned: true } : t.newick))
  );
}

/** Stored trees that no longer parse are skipped. */
export function deserializeBuiltTrees(raw: string): BuiltTree[] {
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(stored)) return [];
  return stored
    .flatMap((entry): [string, boolean][] => {
      if (typeof entry === 'string') return [[entry, false]];
      if (
        typeof entry === 'object' &&
        entry != null &&
        typeof entry.newick === 'string'
      ) {
        return [[entry.newick, entry.pruned === true]];
      }
      return [];
    })
    .flatMap(([newick, pruned]) => {
      try {
        return [makeBuiltTree(newick, pruned)];
      } catch {
        return [];
      }
    })
    .slice(-MAX_BUILT_TREES);
}

/** The trees a job built, without the ones derived by pruning. */
export function withoutPrunedTrees(trees: BuiltTree[]): BuiltTree[] {
  return trees.filter((t) => !t.pruned);
}
