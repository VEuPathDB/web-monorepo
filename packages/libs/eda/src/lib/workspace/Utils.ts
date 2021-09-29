import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Variable, VariableTreeNode } from '../core/types/study';

import './EDAWorkspace.scss';
export const cx = makeClassNameHelper('EDAWorkspace');

export function findFirstVariable(
  variables: VariableTreeNode[],
  parentId: string
): Variable | undefined {
  // look for featured variables and return the first if any
  const featuredVariable = variables.find(
    (v) => v.type !== 'category' && v.isFeatured
  );
  if (featuredVariable) return featuredVariable as Variable;

  // no featured vars; find first var with passed parentId (category id or enclosing entity id)
  const variable = variables.find((v) => v.parentId === parentId);

  // if no nodes have this as parent, tree is broken because entity or category has no children
  if (variable == null) {
    // TODO: return undefined here instead?
    throw 'Tree is broken; no variables with parent ' + parentId;
  }

  // if first var is a category, find first var beneath; otherwise return var
  return variable.type === 'category'
    ? findFirstVariable(variables, variable.id)
    : (variable as Variable);
}
