import { negate } from 'lodash';

import { ChildrenGetter } from 'wdk-client/Utils/TreeUtils';

type VisibilityFilter<T> = (node: T) => boolean;

export function getFilteredNodeChildren<T>(
  getNodeChildren: ChildrenGetter<T>,
  visibilityFilter: VisibilityFilter<T>
) {
  return function (node: T) {
    return getNodeChildren(node).filter(visibilityFilter);
  }
};

export function nodeSearchPredicateWithHiddenNodes<T>(
  getNodeChildren: ChildrenGetter<T>,
  nodeSearchPredicate: (node: T, searchQueryTerms: string[]) => boolean,
  visibilityFilter: VisibilityFilter<T>
) {
  return function (node: T, searchQueryTerms: string[]) {
    return (
      nodeSearchPredicate(node, searchQueryTerms) ||
      getNodeChildren(node)
        .filter(negate(visibilityFilter))
        .some(node => nodeSearchPredicate(node, searchQueryTerms))
    );
  }
};
