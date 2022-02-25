import { isFilterField } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { FieldWithMetadata } from '../core/types/study';

import './EDAWorkspace.scss';
export const cx = makeClassNameHelper('EDAWorkspace');

/**
 * Given a field tree and entity ID, return either:
 *
 * 1. The "first" featured variable for that entity, or, if none exist,
 * 2. The "first" selectable variable for that entity, or if none exist,
 * 3. undefined
 *
 * (Here, we mean "first" in the sense of preorder traversal of the field tree.)
 */
export function findFirstVariable(
  fieldTree: TreeNode<FieldWithMetadata>,
  entityId: string,
  isSelectable = (node: TreeNode<FieldWithMetadata>) =>
    isFilterField(node.field)
): TreeNode<FieldWithMetadata> | undefined {
  const entitySubtree = preorderSeq(fieldTree).find(
    (node) => node.field.term === `entity:${entityId}`
  );

  if (entitySubtree == null) {
    throw new Error('Tried to find the first variable of a nonexistent entity');
  }

  return (
    preorderSeq(entitySubtree).find((node) => node.field.isFeatured === true) ??
    preorderSeq(entitySubtree).find(isSelectable)
  );
}
