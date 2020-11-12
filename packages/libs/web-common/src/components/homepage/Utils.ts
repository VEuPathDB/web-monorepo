import { useMemo } from 'react';

import { orderBy } from 'lodash';

import { CategoryTreeNode, getDisplayName } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { mapStructure } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

export const combineClassNames = (...classNames: (string | undefined )[]) =>
  classNames.filter(className => className).join(' ');

export function useAlphabetizedSearchTree(searchTree?: CategoryTreeNode) {
  const result = useMemo(() => {
    if (searchTree == null) {
      return undefined;
    }

    return mapStructure(
      (node, mappedChildren: CategoryTreeNode[]) => {
        return {
          ...node,
          children: node === searchTree
            ? mappedChildren
            : orderBy(
              [...mappedChildren],
              getDisplayName
            )
        };
      },
      node => node.children,
      searchTree
    );
  }, [ searchTree ]);

  return result;
}
