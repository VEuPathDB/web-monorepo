import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Core,
  EdgeDefinition,
  EventObjectEdge,
  EventObjectNode,
  EdgeSingular,
  NodeDefinition,
  NodeSingular,
  Stylesheet
} from 'cytoscape';
import produce from 'immer';
import { noop, orderBy, range } from 'lodash';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  EdgeType,
  NodeDisplayType,
  ProteinType,
  corePeripheralLegendColors,
  edgeTypeDisplayNames
} from '../../utils/clusterGraph';
import {
  EcNumberEntry,
  EdgeEntry,
  GroupLayout,
  NodeEntry,
  PfamDomainEntry
} from '../../utils/groupLayout';
import { TaxonUiMetadata } from '../../utils/taxons';

import './ClusterGraphCanvas.scss';

const MAX_PIE_SLICES = 16;

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

  const [ highlightedNodeIds, setHighlightedNodeIds ] = useState<string[]>([]);
  const previousHighlightedNodeIds = usePreviousValue(highlightedNodeIds);

  const [ highlightedEdgeId, setHighlightedEdgeId ] = useState<string | undefined>(undefined);
  const previousHighlightedEdgeId = usePreviousValue(highlightedEdgeId);

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
    setHighlightedNodeIds(highlightedLegendNodeIds);
  }, [ highlightedLegendNodeIds ]);

  useEffect(() => {
    const newHighlightedNodeIds = highlightedSequenceNodeId == null
      ? [ ]
      : [ highlightedSequenceNodeId ];

    setHighlightedNodeIds(newHighlightedNodeIds);
  }, [ highlightedSequenceNodeId ]);

  useEffect(() => {
    setHighlightedEdgeId(highlightedBlastEdgeId);
  }, [ highlightedBlastEdgeId ]);

  const onMouseLeaveCanvas = useCallback(() => {
    setHighlightedNodeIds([]);
    setHighlightedEdgeId(undefined);
  }, []);

  useCyEffect(cyRef, cy => {
    const handleNodeClick = makeHandleNodeClick(onClickNode);

    cy.on('click', 'node', handleNodeClick);

    return () => {
      cy.off('click', 'node', handleNodeClick);
    };
  }, [ onClickNode ]);

  useCyEffect(cyRef, cy => {
    const handleNodeMouseOver = makeHandleNodeMouseOver(setHighlightedNodeIds);
    const handleNodeMouseOut = makeHandleNodeMouseOut(setHighlightedNodeIds);

    cy.on('mouseover', 'node', handleNodeMouseOver);
    cy.on('mouseout', 'node', handleNodeMouseOut);

    return () => {
      cy.off('mouseover', 'node', handleNodeMouseOver);
      cy.off('mouseout', 'node', handleNodeMouseOut);
    };
  }, []);

  useCyEffect(cyRef, cy => {
    const handleEdgeMouseOver = makeHandleEdgeMouseOver(setHighlightedEdgeId);
    const handleEdgeMouseOut = makeHandleEdgeMouseOut(setHighlightedEdgeId);

    cy.on('mouseover', 'edge', handleEdgeMouseOver);
    cy.on('mouseout', 'edge', handleEdgeMouseOut);

    return () => {
      cy.off('mouseover', 'edge', handleEdgeMouseOver);
      cy.off('mouseout', 'edge', handleEdgeMouseOut);
    };
  }, []);

  useCyEffect(cyRef, cy => {
    cy.batch(() => {
      cy.edges().forEach(unhighlightEdgeType);

      cy.edges().forEach(edge => {
        if (edge.data('type') === highlightedEdgeType) {
          highlightEdgeType(edge);
        }
      })
    });
  }, [ highlightedEdgeType ]);

  useCyEffect(cyRef, cy => {
    cy.batch(() => {
      cy.edges().forEach(unfilterEdge);

      const maxEValue = parseFloat(`1e${eValueExp}`);

      cy.edges().forEach(edge => {
        if (
          !selectedEdgeTypes[edge.data('type') as EdgeType] ||
          edge.data('eValue') > maxEValue
        ) {
          filterEdge(edge);
        }
      });
    });
  }, [ eValueExp, selectedEdgeTypes ]);

  useCyEffect(cyRef, cy => {
    cy.batch(() => {
      previousHighlightedNodeIds?.forEach(nodeId => {
        const previousHighlighedNode = cy.nodes().getElementById(nodeId);
        unhighlightNode(previousHighlighedNode);
      });

      highlightedNodeIds.forEach(nodeId => {
        const newHighlighedNode = cy.nodes().getElementById(nodeId);
        highlightNode(newHighlighedNode);
      });
    });
  }, [ highlightedNodeIds ]);

  useCyEffect(cyRef, cy => {
    cy.batch(() => {
      if (previousHighlightedEdgeId != null) {
        const previousHightlightedEdge = cy.edges().getElementById(previousHighlightedEdgeId);
        unhighlightEdge(previousHightlightedEdge);
      }

      if (highlightedEdgeId != null) {
        const newHighlightedEdge = cy.edges().getElementById(highlightedEdgeId);
        highlightEdge(newHighlightedEdge);
      }
    });
  }, [ highlightedEdgeId ]);

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

function useCytoscapeConfig(
  layout: GroupLayout,
  corePeripheralMap: Record<string, ProteinType>,
  taxonUiMetadata: TaxonUiMetadata,
  selectedNodeDisplayType: NodeDisplayType
) {
  const orderedEcNumbers = useOrderedEcNumbers(layout);
  const ecNumberNPieSlices = Math.min(orderedEcNumbers.length, MAX_PIE_SLICES);

  const orderedPfamDomains = useOrderedPfamDomains(layout);
  const pfamDomainNPieSlices = Math.min(orderedPfamDomains.length, MAX_PIE_SLICES);

  const nodes = useNodes(
    layout,
    corePeripheralMap,
    taxonUiMetadata,
    orderedEcNumbers,
    ecNumberNPieSlices,
    orderedPfamDomains,
    pfamDomainNPieSlices,
    selectedNodeDisplayType
  );

  const edges = useEdges(layout);

  const elements = useMemo(
    () => [ ...nodes, ...edges ],
    [ nodes, edges ]
  );

  const stylesheet = useStylesheet(
    ecNumberNPieSlices,
    pfamDomainNPieSlices,
    layout.minEvalueExp,
    layout.maxEvalueExp
  );

  const initialCytoscapeConfig = {
    elements,
    stylesheet,
    layout: { name: 'preset' },
    zoom: 1,
    zoomingEnabled: false,
    userZoomingEnabled: false,
    boxSelectionEnabled: false,
    autoungrabify: true,
    autounselectify: true
  };

  return useState(initialCytoscapeConfig);
}

interface CyEffectCallback {
  (cy: Core): (void | (() => void | undefined));
};

function useCyEffect(
  cyRef: React.MutableRefObject<Core | undefined>,
  effect: CyEffectCallback,
  deps?: React.DependencyList
) {
  useEffect(() => {
    if (cyRef.current == null) {
      return noop;
    }

    return effect(cyRef.current);
  }, deps == null ? [ cyRef.current ] : [ cyRef.current, ...deps ]);
}

function useOrderedEcNumbers(layout: GroupLayout) {
  return useMemo(
    () => orderBy(
      Object.values(layout.group.ecNumbers),
      [ ecNumber => ecNumber.count, ecNumber => ecNumber.index ],
      [ 'desc', 'asc' ]
    ),
    [ layout ]
  );
}

function useOrderedPfamDomains(layout: GroupLayout) {
  return useMemo(
    () => orderBy(
      Object.values(layout.group.pfamDomains),
      [ pfamDomain => pfamDomain.count, pfamDomain => pfamDomain.index ],
      [ 'desc', 'asc' ]
    ),
    [ layout ]
  );
}

function useNodes(
  layout: GroupLayout,
  corePeripheralMap: Record<string, ProteinType>,
  taxonUiMetadata: TaxonUiMetadata,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number,
  selectedNodeDisplayType: string
): NodeDefinition[] {
  return useMemo(
    () =>
      Object.values(layout.nodes).map(
        nodeEntry =>
          ({
            group: 'nodes',
            classes: selectedNodeDisplayType,
            data: (
              nodeEntryToCytoscapeData(
                nodeEntry,
                layout,
                corePeripheralMap,
                taxonUiMetadata,
                orderedEcNumbers,
                ecNumberNPieSlices,
                orderedPfamDomains,
                pfamDomainNPieSlices
              )
            ),
            position: {
              x: Number(nodeEntry.x),
              y: Number(nodeEntry.y)
            }
          })
      ),
      [ layout ]
  );
}

interface NodeData {
  id: string;
  corePeripheralColor: string;
  groupColor: string;
  speciesColor: string;
  ecPieColors: string[];
  ecPieSliceSize: string;
  pfamPieColors: string[];
  pfamPieSliceSize: string;
}

function nodeEntryToCytoscapeData(
  nodeEntry: NodeEntry,
  layout: GroupLayout,
  corePeripheralMap: Record<string, ProteinType>,
  taxonUiMetadata: TaxonUiMetadata,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number
): NodeData {
  return {
    id: nodeEntry.id,
    corePeripheralColor: nodeEntryToCorePeripheralColor(nodeEntry, layout, corePeripheralMap),
    ...nodeEntryToTaxonColors(nodeEntry, layout, taxonUiMetadata),
    ...nodeEntryToEcNumberPieData(nodeEntry, layout, orderedEcNumbers, ecNumberNPieSlices),
    ...nodeEntryToPfamDomainPieData(nodeEntry, layout, orderedPfamDomains, pfamDomainNPieSlices),
  };
}

function nodeEntryToCorePeripheralColor(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  corePeripheralMap: Record<string, ProteinType>
) {
  const taxonAbbrev = genes[nodeEntry.id].taxon.abbrev;
  const proteinType = corePeripheralMap[taxonAbbrev];

  return corePeripheralLegendColors[proteinType];
}

function nodeEntryToTaxonColors(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  { species }: TaxonUiMetadata
) {
  const taxonAbbrev = genes[nodeEntry.id].taxon.abbrev;
  const nodeSpecies = species[taxonAbbrev];

  return {
    groupColor: nodeSpecies.groupColor,
    speciesColor: nodeSpecies.color
  };
}

function nodeEntryToEcNumberPieData(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number
) {
  const nodeEcNumbers = genes[nodeEntry.id].ecNumbers;

  const ecPieColors = orderedEcNumbers.slice(0, ecNumberNPieSlices).map(
    ecNumber => nodeEcNumbers.includes(ecNumber.code)
      ? ecNumber.color
      : 'white'
  );

  return {
    ecPieColors,
    ecPieSliceSize: `${(100 / ecNumberNPieSlices)}%`
  };
}

function nodeEntryToPfamDomainPieData(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number
) {
  const nodePfamDomains = Object.keys(genes[nodeEntry.id].pfamDomains);

  const pfamPieColors = orderedPfamDomains.slice(0, pfamDomainNPieSlices).map(
    pfamDomain => nodePfamDomains.includes(pfamDomain.accession)
      ? pfamDomain.color
      : 'white'
  );

  return {
    pfamPieColors,
    pfamPieSliceSize: `${(100 / pfamDomainNPieSlices)}%`
  };
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  eValue: number;
  score: number;
}

function useEdges(layout: GroupLayout): EdgeDefinition[] {
  return useMemo(
    () =>
      Object.entries(layout.edges)
        .map(([ edgeId, edgeEntry ]) =>
          ({
            group: 'edges',
            data: makeEdgeData(edgeId, edgeEntry),
            selectable: false
          }) as const
        )
        .sort((e1, e2) => e2.data.score - e1.data.score),
    [ layout.edges ]
  );
}

function makeEdgeData(edgeId: string, edgeEntry: EdgeEntry): EdgeData {
  return {
    id: edgeId,
    source: edgeEntry.queryId,
    target: edgeEntry.subjectId,
    type: edgeEntry.T,
    label: `${edgeTypeDisplayNames[edgeEntry.T]}, evalue=${edgeEntry.E}`,
    eValue: Number(edgeEntry.E),
    score: edgeEntry.score
  };
}

function useStylesheet(
  ecNumberNPieSlices: number,
  pfamDomainNPieSlices: number,
  minEvalueExp: number,
  maxEvalueExp: number
): Stylesheet[] {
  return useMemo(
    () => [
      {
        selector: 'node',
        css: {
          'shape': 'ellipse',
          'width': 20,
          'height': 20,
          'z-index-compare': 'manual',
          'z-index': 2
        }
      },
      {
        selector: 'node.taxa',
        css: {
          'background-color': 'data(speciesColor)',
          'border-color': 'data(groupColor)',
          'border-width': 6
        }
      },
      {
        selector: 'node.ec-numbers',
        css: {
          'background-color': 'white',
          'border-color': 'black',
          'border-width': 1,
          ...makePieStyles(ecNumberNPieSlices, 'ec')
        }
      },
      {
        selector: 'node.pfam-domains',
        css: {
          'background-color': 'white',
          'border-color': 'black',
          'border-width': 1,
          ...makePieStyles(pfamDomainNPieSlices, 'pfam')
        }
      },
      {
        selector: 'node.core-peripheral',
        css: {
          'background-color': 'data(corePeripheralColor)',
          'border-color': 'black',
          'border-width': 1,
        }
      },
      {
        selector: 'node.highlighted',
        css: {
          'label': 'data(id)',
          'width': 30,
          'height': 30,
          'text-outline-color': 'white',
          'text-outline-width': 2,
          'text-halign': 'right',
          'text-valign': 'center',
          'text-margin-x': 2,
          'text-margin-y': -6,
          'z-index': 4,
          'font-size': 15,
          'font-weight': 'bold'
        }
      },
      {
        selector: 'edge',
        css: {
          'curve-style': 'straight',
          'line-color': `mapData(score, ${maxEvalueExp}, ${minEvalueExp}, #e9e9e9, black)`,
          'width': 1,
          'z-index-compare': 'manual',
          'z-index': 1
        }
      },
      {
        selector: 'edge.highlighted',
        css: {
          'width': 3,
          'label': 'data(label)',
          'text-outline-color': 'white',
          'text-outline-width': 2,
          'z-index': 3,
          'font-size': 15,
          'font-weight': 'bold'
        }
      },
      {
        selector: 'edge.type-highlighted',
        css: {
          'line-color': 'red'
        }
      },
      {
        selector: 'edge.filtered-out',
        css: {
          'display': 'none'
        }
      }
    ],
    []
  );
}

function makePieStyles(nPieSlices: number, dataPrefix: string) {
  const sliceStyles = range(0, nPieSlices).reduce(
    (memo, i) => ({
      ...memo,
      [`pie-${i + 1}-background-color`]: `data(${dataPrefix}PieColors.${i})`,
      [`pie-${i + 1}-background-size`]: `data(${dataPrefix}PieSliceSize)`
    }),
    {}
  );

  return {
    'pie-size': '100%',
    ...sliceStyles
  };
}

function makeHandleNodeClick(onClickNode: Props['onClickNode']) {
  return function(evt: EventObjectNode) {
    onClickNode(evt.target.data('id'));
  };
}

function makeHandleNodeMouseOver(setHighlightedNodeIds: (highlightedNodeIds: string[]) => void) {
  return function(evt: EventObjectNode) {
    setHighlightedNodeIds([ evt.target.data('id') ]);
  }
}

function makeHandleNodeMouseOut(setHighlightedNodeIds: (highlightedNodeIds: string[]) => void) {
  return function(_: EventObjectNode) {
    setHighlightedNodeIds([]);
  }
}

function makeHandleEdgeMouseOver(setHighlightedEdgeId: (highlightedEdgeId: string | undefined) => void) {
  return function(evt: EventObjectEdge) {
    setHighlightedEdgeId(evt.target.data('id'));
  }
}

function makeHandleEdgeMouseOut(setHighlightedEdgeId: (highlightedEdgeId: string | undefined) => void) {
  return function(_: EventObjectEdge) {
    setHighlightedEdgeId(undefined);
  }
}

function highlightNode(node: NodeSingular) {
  node.addClass('highlighted');
}

function unhighlightNode(node: NodeSingular) {
  node.removeClass('highlighted');
}

function highlightEdge(edge: EdgeSingular) {
  const source = edge.source();
  const target = edge.target();

  const [ leftNode, rightNode ] = source.position('x') <= target.position('x')
    ? [ source, target ]
    : [ target, source ];

  leftNode.style('text-halign', 'left');
  rightNode.style('text-halign', 'right');

  const [ topNode, bottomNode ] = source.position('y') <= target.position('y')
    ? [ source, target ]
    : [ target, source ];

  topNode
    .style('text-valign', 'top')
    .style('text-margin-y', 10);

  bottomNode
    .style('text-valign', 'bottom')
    .style('text-margin-y', -16);

  edge.addClass('highlighted');
  source.addClass('highlighted');
  target.addClass('highlighted');
}

function unhighlightEdge(edge: EdgeSingular) {
  const source = edge.source();
  const target = edge.target();

  edge.removeClass('highlighted');

  source
    .removeClass('highlighted')
    .style('text-valign', null)
    .style('text-margin-y', null);

  target
    .removeClass('highlighted')
    .style('text-valign', null)
    .style('text-margin-y', null);
}

function highlightEdgeType(edge: EdgeSingular) {
  edge.addClass('type-highlighted');
}

function unhighlightEdgeType(edge: EdgeSingular) {
  edge.removeClass('type-highlighted');
}

function filterEdge(edge: EdgeSingular) {
  edge.addClass('filtered-out');
}

function unfilterEdge(edge: EdgeSingular) {
  edge.removeClass('filtered-out');
}

// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
function usePreviousValue<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
