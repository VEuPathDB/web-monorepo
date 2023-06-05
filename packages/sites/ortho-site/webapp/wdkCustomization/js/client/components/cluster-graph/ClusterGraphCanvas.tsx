import React, { useCallback, useEffect, useRef } from 'react';

import { Core, use } from 'cytoscape';
import produce from 'immer';
import cola from 'cytoscape-cola';
import CytoscapeComponent from 'react-cytoscapejs';

use(cola);

import { useCytoscapeConfig } from 'ortho-client/hooks/cytoscapeData';
import {
  useEdgeMouseMovementEventHandlers,
  useNodeClickEventHandler,
  useNodeMouseMovementEventHandlers,
  useUpdateHighlightedEdge,
  useUpdateHighlightedNodes,
} from 'ortho-client/hooks/cytoscapeEventHandlers';

import {
  EdgeType,
  NodeDisplayType,
  ProteinType,
} from 'ortho-client/utils/clusterGraph';
import {
  addCytoscapeClass,
  removeCytoscapeClass,
} from 'ortho-client/utils/cytoscapeClasses';
import { GroupLayout } from 'ortho-client/utils/groupLayout';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

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
  onClickNode,
}: Props) {
  const cyRef = useRef<Core>();
  const [cytoscapeConfig, setCytoscapeConfig] = useCytoscapeConfig(
    layout,
    corePeripheralMap,
    taxonUiMetadata,
    selectedNodeDisplayType
  );

  const updateHighlightedNodes = useUpdateHighlightedNodes(
    cytoscapeConfig,
    setCytoscapeConfig
  );
  const updateHighlightedEdge = useUpdateHighlightedEdge(
    cyRef.current,
    cytoscapeConfig,
    setCytoscapeConfig
  );

  const onMouseLeaveCanvas = useCallback(() => {
    updateHighlightedNodes([]);
    updateHighlightedEdge(undefined);
  }, [updateHighlightedNodes, updateHighlightedEdge]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, (draftConfig) => {
      draftConfig.elements.forEach((element) => {
        if (element.group === 'nodes') {
          element.classes = selectedNodeDisplayType;
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [selectedNodeDisplayType]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, (draftConfig) => {
      const maxEValue = parseFloat(`1e${eValueExp}`);

      draftConfig.elements.forEach((element) => {
        if (element.group === 'edges') {
          if (
            !selectedEdgeTypes[element.data.type as EdgeType] ||
            element.data.eValue > maxEValue
          ) {
            element.classes = addCytoscapeClass(
              element.classes,
              'filtered-out'
            );
          } else {
            element.classes = removeCytoscapeClass(
              element.classes,
              'filtered-out'
            );
          }
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [eValueExp, selectedEdgeTypes]);

  useEffect(() => {
    updateHighlightedNodes(highlightedLegendNodeIds);
  }, [highlightedLegendNodeIds]);

  useEffect(() => {
    const newHighlightedNodeIds =
      highlightedSequenceNodeId == null ? [] : [highlightedSequenceNodeId];

    updateHighlightedNodes(newHighlightedNodeIds);
  }, [highlightedSequenceNodeId]);

  useEffect(() => {
    updateHighlightedEdge(highlightedBlastEdgeId);
  }, [highlightedBlastEdgeId]);

  useEffect(() => {
    const newConfig = produce(cytoscapeConfig, (draftConfig) => {
      draftConfig.elements.forEach((element) => {
        if (element.group === 'edges' && element.data.type != null) {
          if (element.data.type === highlightedEdgeType) {
            element.classes = addCytoscapeClass(
              element.classes,
              'type-highlighted'
            );
          } else {
            element.classes = removeCytoscapeClass(
              element.classes,
              'type-highlighted'
            );
          }
        }
      });
    });

    setCytoscapeConfig(newConfig);
  }, [highlightedEdgeType]);

  useNodeClickEventHandler(cyRef, onClickNode);

  useNodeMouseMovementEventHandlers(cyRef, updateHighlightedNodes);

  useEdgeMouseMovementEventHandlers(cyRef, updateHighlightedEdge);

  return (
    <div
      className="ClusterGraphCanvasContainer"
      onMouseLeave={onMouseLeaveCanvas}
    >
      <CytoscapeComponent
        className="ClusterGraphCanvas"
        cy={(cy) => {
          cyRef.current = cy;
        }}
        {...cytoscapeConfig}
      />
    </div>
  );
}
