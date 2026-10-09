import { Branch, parseNewick } from 'patristic';

export const MAX_BUILT_TREES = 5;

export interface BuiltTree {
  /** Identifies the set of proteins the tree covers, not the filter that selected them. */
  key: string;
  newick: string;
  leaves: Branch[];
}

// The ids are joined, not hashed: with at most ~1000 ids per tree that is
// small, can't collide, and avoids the async crypto API.
export function treeKey(ids: Iterable<string>): string {
  return Array.from(ids).sort().join('\n');
}

export function makeBuiltTree(newick: string): BuiltTree {
  const leaves = parseNewick(newick).getLeaves();
  return { key: treeKey(leaves.map((leaf) => leaf.id)), newick, leaves };
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

export function serializeBuiltTrees(trees: BuiltTree[]): string {
  return JSON.stringify(trees.map((t) => t.newick));
}

/** Stored trees that no longer parse are skipped. */
export function deserializeBuiltTrees(raw: string): BuiltTree[] {
  let newicks: unknown;
  try {
    newicks = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(newicks)) return [];
  return newicks
    .filter((n): n is string => typeof n === 'string')
    .flatMap((newick) => {
      try {
        return [makeBuiltTree(newick)];
      } catch {
        return [];
      }
    })
    .slice(-MAX_BUILT_TREES);
}
