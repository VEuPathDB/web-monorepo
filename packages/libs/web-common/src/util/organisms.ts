import { negate } from 'lodash';

import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import {
  Node,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export function pruneNodesWithSingleExtendingChild(
  organismTree: Node<TreeBoxVocabNode>
) {
  return pruneDescendantNodes(
    negate(isNodeWithSingleExtendingChild),
    organismTree
  );
}

export function isNodeWithSingleExtendingChild(node: Node<TreeBoxVocabNode>) {
  return (
    node.children.length === 1 &&
    stripHTML(node.children[0].data.display).startsWith(
      stripHTML(node.data.display)
    )
  );
}
