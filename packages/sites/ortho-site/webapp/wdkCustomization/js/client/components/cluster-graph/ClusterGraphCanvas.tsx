import React, { useCallback, useEffect, useRef } from 'react';

import {
  Core,
  EventObjectEdge,
  EventObjectNode,
  EdgeSingular,
} from 'cytoscape';
import produce from 'immer';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  EdgeType,
  NodeDisplayType,
  ProteinType
} from '../../utils/clusterGraph';
import {
  useCyEffect,
  useCytoscapeConfig
} from '../../hooks/cytoscapeData';
import { GroupLayout } from '../../utils/groupLayout';
import { TaxonUiMetadata } from '../../utils/taxons';

import './ClusterGraphCanvas.scss';

interface Props {
  layout: GroupLayout;
  corePeripheralMap: Record<string, ProteinType>;
  taxonUiMetadata: TaxonUiMetadata;
  selectedEdgeTypes: Record<EdgeType, boolean>;
  highlightedEdgeType: EdgeType | undefined;
  eValueExp: number;
  selectedNodeDisplayType: NodeDisplayType;
  highlightedLegendNodeIds: string[];
  highlightedSequenceNodeId: string | undefined;
  highlightedBlastEdgeId: string | undefined;
  onClickNode: (clickedNode: string) => void;
}

export function ClusterGraphCanvas({
  layout,
  corePeripheralMap,
  taxonUiMetadata,
  selectedEdgeTypes,
  highlightedEdgeType,
  eValueExp,
  selectedNodeDisplayType,
  highlightedLegendNodeIds,
  highlightedSequenceNodeId,
  highlightedBlastEdgeId,
  onClickNode
}: Props) {
  const cyRef = useRef<Core>();

  const [ cytoscapeConfig, setCytoscapeConfig ] = useCytoscapeConfig(
    layout,
    corePeripheralMap,
    taxonUiMetadata,
    selectedNodeDisplayType
  );

  const updateHighlightedNodes = useCallback((highlightedNodeIds: string[]) => {
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

  const updateHighlightedEdge = useCallback((highlightedEdgeId: string | undefined) => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      if (cyRef.current == null) {
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

      const edge = cyRef.current.getElementById(highlightedEdgeId);

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
  }, [ cytoscapeConfig ]);

  const onMouseLeaveCanvas = useCallback(() => {
    updateHighlightedNodes([]);
    updateHighlightedEdge(undefined);
  }, [ updateHighlightedNodes, updateHighlightedEdge ]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      draftConfig.elements.forEach(element => {
        if (element.group === 'nodes') {
          element.classes = selectedNodeDisplayType;
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [ selectedNodeDisplayType ]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      const maxEValue = parseFloat(`1e${eValueExp}`);

      draftConfig.elements.forEach(element => {
        if (element.group === 'edges') {
          if (
            !selectedEdgeTypes[element.data.type as EdgeType] ||
            element.data.eValue > maxEValue
          ) {
            element.classes = addCytoscapeClass(element.classes, 'filtered-out');
          } else {
            element.classes = removeCytoscapeClass(element.classes, 'filtered-out');
          }
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [ eValueExp, selectedEdgeTypes ]);

  useEffect(() => {
    updateHighlightedNodes(highlightedLegendNodeIds);
  }, [ highlightedLegendNodeIds ]);

  useEffect(() => {
    const newHighlightedNodeIds = highlightedSequenceNodeId == null
      ? [ ]
      : [ highlightedSequenceNodeId ];

    updateHighlightedNodes(newHighlightedNodeIds);
  }, [ highlightedSequenceNodeId ]);

  useEffect(() => {
    updateHighlightedEdge(highlightedBlastEdgeId);
  }, [ highlightedBlastEdgeId ]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, draftConfig => {
      draftConfig.elements.forEach(element => {
        if (element.group === 'edges' && element.data.type != null) {
          if (element.data.type === highlightedEdgeType) {
            element.classes = addCytoscapeClass(element.classes, 'type-highlighted');
          } else {
            element.classes = removeCytoscapeClass(element.classes, 'type-highlighted');
          }
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [ highlightedEdgeType ]);

  useCyEffect(cyRef, cy => {
    const handleNodeClick = makeHandleNodeClick(onClickNode);

    cy.on('click', 'node', handleNodeClick);

    return () => {
      cy.off('click', 'node', handleNodeClick);
    };
  }, [ onClickNode ]);

  useCyEffect(cyRef, cy => {
    const handleNodeMouseOver = makeHandleNodeMouseOver(updateHighlightedNodes);
    const handleNodeMouseOut = makeHandleNodeMouseOut(updateHighlightedNodes);

    cy.on('mouseover', 'node', handleNodeMouseOver);
    cy.on('mouseout', 'node', handleNodeMouseOut);

    return () => {
      cy.off('mouseover', 'node', handleNodeMouseOver);
      cy.off('mouseout', 'node', handleNodeMouseOut);
    };
  }, [ updateHighlightedNodes ]);

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

  return (
    <div
      className="ClusterGraphCanvasContainer"
      onMouseLeave={onMouseLeaveCanvas}
    >
      <CytoscapeComponent
        className="ClusterGraphCanvas"
        cy={cy => {
          cyRef.current = cy;
        }}
        {...cytoscapeConfig}
      />
    </div>
  );
}

function makeHandleNodeClick(onClickNode: Props['onClickNode']) {
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

function addCytoscapeClass(existingClasses: string | undefined, classToAdd: string) {
  const existingClassesString = existingClasses ?? '';

  const existingClassesArray = existingClassesString.trim().split(/\s+/g);

  return existingClassesArray.includes(classToAdd)
    ? existingClasses
    : [ ...existingClassesArray, classToAdd ].join(' ');
}

function addCytoscapeClasses(existingClasses: string | undefined, classesToAdd: string[]) {
  return classesToAdd.reduce(addCytoscapeClass, existingClasses);
}

function removeCytoscapeClass(existingClasses: string | undefined, classToRemove: string) {
  const existingClassesString = existingClasses ?? '';

  const existingClassesArray = existingClassesString.trim().split(/\s+/g);

  return !existingClassesArray.includes(classToRemove)
    ? existingClasses
    : existingClassesArray
        .filter(existingClass => existingClass !== classToRemove)
        .join(' ');
}

function removeCytoscapeClasses(existingClasses: string | undefined, classesToRemove: string[]) {
  return classesToRemove.reduce(removeCytoscapeClass, existingClasses);
}

function addAndRemoveCytoscapeClasses(
  existingClasses: string | undefined,
  classesToAdd: string[],
  classesToRemove: string[]
) {
  return removeCytoscapeClasses(
    addCytoscapeClasses(existingClasses, classesToAdd),
    classesToRemove
  );
}
