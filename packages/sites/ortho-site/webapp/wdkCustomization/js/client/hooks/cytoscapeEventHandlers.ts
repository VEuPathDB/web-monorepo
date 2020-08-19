import { useCallback } from 'react';

import {
  Core,
  EdgeSingular,
  EventObjectEdge,
  EventObjectNode
} from 'cytoscape';
import produce from 'immer';

import {
  CytoscapeConfig,
  useCyEffect
} from 'ortho-client/hooks/cytoscapeData';
import {
  addAndRemoveCytoscapeClasses,
  addCytoscapeClass,
  removeCytoscapeClass,
  removeCytoscapeClasses
} from 'ortho-client/utils/cytoscapeClasses';

export function useUpdateHighlightedNodes(
  cytoscapeConfig: CytoscapeConfig,
  setCytoscapeConfig: (newConfig: CytoscapeConfig) => void
) {
  return useCallback((highlightedNodeIds: string[]) => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      const highlightedNodeIdsSet = new Set(highlightedNodeIds);

      draftConfig.elements.forEach(element => {
        if (element.group === 'nodes' && element.data.id != null) {
          if (highlightedNodeIdsSet.has(element.data.id)) {
            element.classes = addCytoscapeClass(element.classes, 'highlighted');
          } else {
            element.classes = removeCytoscapeClass(element.classes, 'highlighted');
          }
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [ cytoscapeConfig ]);
}

export function useUpdateHighlightedEdge(
  cy: Core | undefined,
  cytoscapeConfig: CytoscapeConfig,
  setCytoscapeConfig: (newConfig: CytoscapeConfig) => void
) {
  return useCallback((highlightedEdgeId: string | undefined) => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      if (cy == null) {
        return;
      }
  
      if (highlightedEdgeId === undefined) {
        draftConfig.elements.forEach(element => {
          element.classes = removeCytoscapeClasses(
            element.classes,
            [
              'highlighted',
              'left',
              'right',
              'top',
              'bottom'
            ]
          );
        });
  
        return;
      }
  
      const edge = cy.getElementById(highlightedEdgeId);
  
      const {
        source: highlightedSourceClasses,
        target: highlightedTargetClasses
      } = makeHighlightedEdgeNodeClasses(edge);
  
      const sourceId = highlightedSourceClasses.elementId;
      const targetId = highlightedTargetClasses.elementId;
  
      draftConfig.elements.forEach(element => {
        if (element.data.id === highlightedEdgeId) {
          element.classes = addCytoscapeClass(element.classes, 'highlighted');
        } else if (element.data.id === sourceId) {
          element.classes = addAndRemoveCytoscapeClasses(
            element.classes,
            highlightedSourceClasses.classesToAdd,
            highlightedSourceClasses.classesToRemove
          );
        } else if (element.data.id === targetId) {
          element.classes = addAndRemoveCytoscapeClasses(
            element.classes,
            highlightedTargetClasses.classesToAdd,
            highlightedTargetClasses.classesToRemove
          );
        } else {
          element.classes = removeCytoscapeClasses(
            element.classes,
            [
              'highlighted',
              'left',
              'right',
              'top',
              'bottom'
            ]
          );
        }
      });
    });
  
    setCytoscapeConfig(newConfig);
  }, [ cytoscapeConfig, cy ]);
}

export function useNodeClickEventHandler(
  cyRef: React.MutableRefObject<Core | undefined>,
  onClickNode: (clickedNodeId: string) => void
) {
  useCyEffect(cyRef, cy => {
    const handleNodeClick = makeHandleNodeClick(onClickNode);

    cy.on('click', 'node', handleNodeClick);

    return () => {
      cy.off('click', 'node', handleNodeClick);
    };
  }, [ onClickNode ]);
}

export function useNodeMouseMovementEventHandlers(
  cyRef: React.MutableRefObject<Core | undefined>,
  updateHighlightedNodes: ReturnType<typeof useUpdateHighlightedNodes>
) {
  useCyEffect(cyRef, cy => {
    const handleNodeMouseOver = makeHandleNodeMouseOver(updateHighlightedNodes);
    const handleNodeMouseOut = makeHandleNodeMouseOut(updateHighlightedNodes);

    cy.on('mouseover', 'node', handleNodeMouseOver);
    cy.on('mouseout', 'node', handleNodeMouseOut);

    return () => {
      cy.off('mouseover', 'node', handleNodeMouseOver);
      cy.off('mouseout', 'node', handleNodeMouseOut);
    };
  }, [ updateHighlightedNodes ])
};

export function useEdgeMouseMovementEventHandlers(
  cyRef: React.MutableRefObject<Core | undefined>,
  updateHighlightedEdge: ReturnType<typeof useUpdateHighlightedEdge>
) {
  useCyEffect(cyRef, cy => {
    const handleEdgeMouseOver = makeHandleEdgeMouseOver(updateHighlightedEdge);
    const handleEdgeMouseOut = makeHandleEdgeMouseOut(updateHighlightedEdge);

    cy.on('mouseover', 'edge', handleEdgeMouseOver);
    cy.on('mouseout', 'edge', handleEdgeMouseOut);

    return () => {
      cy.off('mouseover', 'edge', handleEdgeMouseOver);
      cy.off('mouseout', 'edge', handleEdgeMouseOut);
    };
  }, [ updateHighlightedEdge ]);
}

function makeHandleNodeClick(onClickNode: (clickedNodeId: string) => void) {
  return function(evt: EventObjectNode) {
    onClickNode(evt.target.data('id'));
  };
}

function makeHandleNodeMouseOver(updateHighlightedNodes: (highlightedNodeIds: string[]) => void) {
  return function(evt: EventObjectNode) {
    updateHighlightedNodes([ evt.target.data('id') ]);
  }
}

function makeHandleNodeMouseOut(updateHighlightedNodes: (highlightedNodeIds: string[]) => void) {
  return function(_: EventObjectNode) {
    updateHighlightedNodes([]);
  }
}

function makeHandleEdgeMouseOver(updateHighlightedEdge: (highlightedEdgeId: string | undefined) => void) {
  return function(evt: EventObjectEdge) {
    updateHighlightedEdge(evt.target.data('id'));
  }
}

function makeHandleEdgeMouseOut(updateHighlightedEdge: (highlightedEdgeId: string | undefined) => void) {
  return function(evt: EventObjectEdge) {
    evt.target.removeClass('highlighted');

    updateHighlightedEdge(undefined);
  }
}

function makeHighlightedEdgeNodeClasses(edge: EdgeSingular) {
  const source = edge.source();
  const target = edge.target();

  const [ sourceHAlignClass, targetHAlignClass ] = source.position('x') <= target.position('x')
    ? [ 'left', 'right' ]
    : [ 'right', 'left' ];

  const [ sourceVAlignClass, targetVAlignClass ] = source.position('y') <= target.position('y')
    ? [ 'top', 'bottom' ]
    : [ 'bottom', 'top' ];

  return {
    source: {
      elementId: source.id(),
      classesToAdd: [ 'highlighted', sourceHAlignClass, sourceVAlignClass ],
      classesToRemove: [ targetHAlignClass, targetVAlignClass ]
    },
    target: {
      elementId: target.id(),
      classesToAdd: [ 'highlighted', targetHAlignClass, targetVAlignClass ],
      classesToRemove: [ sourceHAlignClass, sourceVAlignClass ]
    }
  };
}
