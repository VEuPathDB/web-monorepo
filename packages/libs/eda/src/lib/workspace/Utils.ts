import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableTreeNode } from '../core/types/study';

import './EDAWorkspace.scss';
export const cx = makeClassNameHelper('EDAWorkspace');

export function findFirstVariable(
  variables: VariableTreeNode[],
  parentId: string
): VariableTreeNode | undefined {
  const variable = variables.find((v) => v.parentId === parentId);
  if (variable == null) return variables.find((v) => v.dataShape != null);
  if (variable.dataShape != null) return variable;
  return findFirstVariable(variables, variable.id);
}
