import { NodeCollection, NodeSingular } from 'cytoscape';
import { curry } from 'lodash/fp';

export type NodeSearchCriteria = string | ((node: NodeSingular) => boolean);

export const highlightNodes = curry(
  (highlightingClass: string, nodes: NodeCollection) => {
    return nodes.addClass(highlightingClass);
  }
);

export const clearHighlighting = curry(
  (highlightingClass: string, nodes: NodeCollection) => {
    return nodes.removeClass(highlightingClass);
  }
);

export const filterNodes = curry(
  (criteria: NodeSearchCriteria, nodes: NodeCollection) => {
    return nodes.filter(criteria);
  }
);
