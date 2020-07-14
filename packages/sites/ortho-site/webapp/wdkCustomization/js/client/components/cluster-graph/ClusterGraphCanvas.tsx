import React, { useEffect, useMemo, useRef } from 'react';

import cytoscape, {
  Core,
  CytoscapeOptions,
  EdgeDefinition,
  EventHandler,
  EventObject,
  NodeDefinition,
  Stylesheet
} from 'cytoscape';
import { noop, orderBy, range } from 'lodash';

import { NodeDisplayType } from '../../utils/clusterGraph';
import {
  EcNumberEntry,
  GroupLayout,
  NodeEntry,
  PfamDomainEntry
} from '../../utils/groupLayout';
import { TaxonUiMetadata } from '../../utils/taxons';

import './ClusterGraphCanvas.scss';

const MAX_PIE_SLICES = 16;

interface Props {
  layout: GroupLayout;
  taxonUiMetadata: TaxonUiMetadata;
  selectedNodeDisplayType: NodeDisplayType;
}

export function ClusterGraphCanvas({
  layout,
  taxonUiMetadata,
  selectedNodeDisplayType
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core>();

  useInitializeCyEffect(canvasRef, cyRef, layout, taxonUiMetadata);

  useCyEffect(cyRef, cy => {
    cy.on('mouseover', 'node', handleNodeMouseover);
    cy.on('mouseout', 'node', handleNodeMouseout);

    return () => {
      cy.off('mouseover', 'node', handleNodeMouseover);
      cy.off('mouseout', 'node', handleNodeMouseover);
    };
  }, []);

  useCyEffect(cyRef, cy => {
    cy.on('mouseover', 'edge', handleEdgeMouseover);
    cy.on('mouseout', 'edge', handleEdgeMouseout);

    return () => {
      cy.off('mouseover', 'edge', handleEdgeMouseover);
      cy.off('mouseout', 'edge', handleEdgeMouseover);
    };
  }, []);

  useCyEffect(cyRef, cy => {
    cy.nodes().classes(selectedNodeDisplayType);
  }, [ selectedNodeDisplayType ]);

  return <div ref={canvasRef} className="ClusterGraphCanvas"></div>;
}

function useInitializeCyEffect(
  canvasRef: React.RefObject<HTMLDivElement>,
  cyRef: React.MutableRefObject<Core | undefined>,
  layout: GroupLayout,
  taxonUiMetadata: TaxonUiMetadata
) {
  const orderedEcNumbers = useOrderedEcNumbers(layout);
  const ecNumberNPieSlices = Math.min(orderedEcNumbers.length, MAX_PIE_SLICES);

  const orderedPfamDomains = useOrderedPfamDomains(layout);
  const pfamDomainNPieSlices = Math.min(orderedPfamDomains.length, MAX_PIE_SLICES);

  const nodes = useNodes(
    layout,
    taxonUiMetadata,
    orderedEcNumbers,
    ecNumberNPieSlices,
    orderedPfamDomains,
    pfamDomainNPieSlices
  );

  const edges = useEdges(layout);
  const style = useStyle(ecNumberNPieSlices, pfamDomainNPieSlices);
  const options = useOptions();

  useEffect(() => {
    if (canvasRef.current != null) {
      const cy = cytoscape({
        container: canvasRef.current,
        elements: { nodes, edges },
        style,
        ...options
      });

      cyRef.current = cy;
    }

    return () => {
      if (cyRef.current != null) {
        cyRef.current.destroy();
      }
    };
  }, [ canvasRef.current, nodes, edges, style, options ]);
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
  taxonUiMetadata: TaxonUiMetadata,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number,
): NodeDefinition[] {
  return useMemo(
    () =>
      Object.values(layout.nodes).map(
        nodeEntry =>
          ({
            group: 'nodes',
            data: nodeEntryToCytoscapeData(
              nodeEntry,
              layout,
              taxonUiMetadata,
              orderedEcNumbers,
              ecNumberNPieSlices,
              orderedPfamDomains,
              pfamDomainNPieSlices
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
  taxonUiMetadata: TaxonUiMetadata,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number
): NodeData {
  return {
    id: nodeEntry.id,
    ...nodeEntryToTaxonColors(nodeEntry, layout, taxonUiMetadata),
    ...nodeEntryToEcNumberPieData(nodeEntry, layout, orderedEcNumbers, ecNumberNPieSlices),
    ...nodeEntryToPfamDomainPieData(nodeEntry, layout, orderedPfamDomains, pfamDomainNPieSlices),
  };
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

function useEdges(layout: GroupLayout): EdgeDefinition[] {
  return useMemo(
    () =>
      Object.entries(layout.edges).map(([ edgeId, edgeEntry ]) =>
        ({
          group: 'edges',
          data: {
            id: edgeId,
            source: edgeEntry.queryId,
            target: edgeEntry.subjectId
          },
          selectable: false
        })
  ), [ layout.edges ]);
}

function useStyle(ecNumberNPieSlices: number, pfamDomainNPieSlices: number): Stylesheet[] {
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
          'z-index': 3,
          'font-size': 15,
          'font-weight': 'bold'
        }
      },
      {
        selector: 'node.highlighted.source.left-to-right, node.highlighted.target.right-to-left',
        css: {
          'text-halign': 'left'
        }
      },
      {
        selector: 'node.highlighted.target.left-to-right, node.highlighted.source.right-to-left',
        css: {
          'text-halign': 'right'
        }
      },
      {
        selector: 'node.highlighted.source.top-to-bottom, node.highlighted.target.bottom-to-top',
        css: {
          'text-valign': 'top',
          'text-margin-y': 10
        }
      },
      {
        selector: 'node.highlighted.target.top-to-bottom, node.highlighted.source.bottom-to-top',
        css: {
          'text-valign': 'bottom',
          'text-margin-y': -16
        }
      },
      {
        selector: 'edge',
        css: {
          'curve-style': 'straight',
          'line-color': 'black',
          'width': 1,
          'opacity': 0.2,
          'z-index-compare': 'manual',
          'z-index': 1
        }
      },
      {
        selector: 'edge.highlighted',
        css: {
          'opacity': 1,
          'width': 3,
          'label': 'data(id)',
          'text-outline-color': 'white',
          'text-outline-width': 2,
          'z-index': 4,
          'font-size': 15,
          'font-weight': 'bold'
        }
      }
    ],
    []
  );
}

function makePieStyles(nPieSlices: number, dataPrefix: string) {
  const sliceStyles = range(0, nPieSlices).reduce(
    (memo, _, i) => ({
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

function useOptions(): CytoscapeOptions {
  return useMemo(
    () => ({
      layout: { name: 'preset' },
      zoom: 1,
      zoomingEnabled: false,
      userZoomingEnabled: false,
      autolock: true,
      panningEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabbify: true,
      autounselectify: true,
      pixelRatio: window.devicePixelRatio
    }),
    []
  );
}

const handleNodeMouseover: EventHandler = function(evt: EventObject) {
  evt.target.addClass('highlighted');
};

const handleNodeMouseout: EventHandler = function(evt: EventObject) {
  evt.target.removeClass('highlighted');
};

const handleEdgeMouseover: EventHandler = function(evt: EventObject) {
  const edge = evt.target;
  const source = edge.source();
  const target = edge.target();

  const horizontalFlow = source.position('x') >= target.position('x')
    ? 'right-to-left'
    : 'left-to-right';

  const verticalFlow = source.position('y') <= target.position('y')
    ? 'top-to-bottom'
    : 'bottom-to-top';

  source
    .addClass('highlighted')
    .addClass('source')
    .addClass(horizontalFlow)
    .addClass(verticalFlow);

  target
    .addClass('highlighted')
    .addClass('target')
    .addClass(horizontalFlow)
    .addClass(verticalFlow);

  edge.addClass('highlighted');
};

const handleEdgeMouseout: EventHandler = function(evt: EventObject) {
  const edge = evt.target;
  const source = edge.source();
  const target = edge.target();

  source
    .removeClass('highlighted')
    .removeClass('source')
    .removeClass('left-to-right')
    .removeClass('right-to-left')
    .removeClass('top-to-bottom')
    .removeClass('bottom-to-top');

  target
    .removeClass('highlighted')
    .removeClass('target')
    .removeClass('left-to-right')
    .removeClass('right-to-left')
    .removeClass('top-to-bottom')
    .removeClass('bottom-to-top');

  edge.removeClass('highlighted');
};
