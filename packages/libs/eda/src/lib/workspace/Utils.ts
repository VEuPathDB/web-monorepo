import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { groupBy } from 'lodash';
import { Variable, VariableTreeNode } from '../core/types/study';

import './EDAWorkspace.scss';
export const cx = makeClassNameHelper('EDAWorkspace');

/**
 * Returns the first featured var; if none exist, then returns the
 * first non-category var in the tree using depth first search.
 */
export function findFirstVariable(variables: VariableTreeNode[]): Variable {
  // look for featured variables and return the first if any
  const featuredVariable = variables.find(
    (v): v is Variable => v.type !== 'category' && v.isFeatured
  );

  if (featuredVariable) return featuredVariable;

  // Find root variables. These are variables whose parent is not present in the provided array.
  const roots = findRootVariables(variables);

  if (roots.length === 0)
    throw new Error('Tree is broken: cannot determine root nodes.');

  // Traverse first branch of tree and find first non-category node
  const variable = findFirstNonCategory(
    groupBy(variables, (v) => v.parentId),
    roots[0]
  );

  // if no nodes have the specified parent, tree is broken because entity or category has no children
  if (variable == null) {
    // TODO: return undefined here instead?
    throw new Error(
      'Tree is broken: could not find a non-category node in first branch.'
    );
  }

  return variable;
}

function findRootVariables(variables: VariableTreeNode[]): VariableTreeNode[] {
  // A variable is a root if its parent variable is not in the provided array.
  // This can happen if parentId == null, or if the parentId refers to a variable
  // that is not included.
  const variableIds = new Set(variables.map((v) => v.id));
  return variables.filter(
    (v) => v.parentId == null || !variableIds.has(v.parentId)
  );
}

function findFirstNonCategory(
  variablesByParentId: Record<string, VariableTreeNode[] | undefined>,
  root: VariableTreeNode
): Variable | undefined {
  const children = variablesByParentId[root.id];
  const firstChild = children && children[0];
  if (firstChild == null) return undefined;
  if (firstChild.type === 'category')
    return findFirstNonCategory(variablesByParentId, firstChild);
  return firstChild;
}
