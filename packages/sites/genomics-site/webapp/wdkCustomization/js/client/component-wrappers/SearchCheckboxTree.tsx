import React, { ComponentType, Suspense, useMemo } from 'react';

import { CategoryTreeNode, isIndividual } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { usePreferredQuestions, usePreferredOrganismsEnabledState } from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

export function SearchCheckboxTree<P extends { searchTree: CategoryTreeNode }>(DefaultComponent: ComponentType<P>): ComponentType<P> {
  const Content = SearchCheckboxTreeContent(DefaultComponent);

  return function VEuPathDBSearchCheckboxTree(props) {
    return (
      <Suspense fallback={<Loading />}>
        <Content {...props} />
      </Suspense>
    );
  };
}

function SearchCheckboxTreeContent<P extends { searchTree: CategoryTreeNode }>(DefaultComponent: ComponentType<P>): ComponentType<P> {
  return function VEuPathDBSearchCheckboxTree(props) {
    const [ preferredOrganismsEnabled ] = usePreferredOrganismsEnabledState();

    const preferredQuestions = usePreferredQuestions();

    const prunedSearchTree = useMemo(
      () => !preferredOrganismsEnabled
        ? props.searchTree
        : pruneDescendantNodes(
            node => {
              if (!isIndividual(node)) {
                return node.children.length > 0;
              }

              return preferredQuestions.has((node.wdkReference as any).urlSegment);
            },
            props.searchTree
          ), 
      [ props.searchTree, preferredOrganismsEnabled, preferredQuestions ]
    );

    return <DefaultComponent {...props} searchTree={prunedSearchTree} />;
  };
}
