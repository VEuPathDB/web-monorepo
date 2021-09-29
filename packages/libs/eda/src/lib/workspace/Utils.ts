import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Variable, VariableTreeNode } from '../core/types/study';

import './EDAWorkspace.scss';
export const cx = makeClassNameHelper('EDAWorkspace');

/**
 * Returns the first featured var; if none exist, then returns the
 * first non-category var in the tree using depth first search.
 */
export function findFirstVariable(
  variables: VariableTreeNode[],
  parentId: string
): Variable | undefined {
  // look for featured variables and return the first if any
  const featuredVariable = variables.find(
    (v): v is Variable => v.type !== 'category' && v.isFeatured
  );
  if (featuredVariable) return featuredVariable;

  // no featured vars; find first var with passed parentId (category id or enclosing entity id)
  const variable = variables.find((v) => v.parentId === parentId);

  // if no nodes have the specified parent, tree is broken because entity or category has no children
  if (variable == null) {
    // TODO: return undefined here instead?
    throw 'Tree is broken; no variables with parent ' + parentId;
  }

  // if first var is a category, find first var beneath; otherwise return var
  return variable.type !== 'category'
    ? variable
    : findFirstVariable(variables, variable.id);
}
