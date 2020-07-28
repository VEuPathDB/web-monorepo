import React, { useEffect, useMemo, useState } from 'react';

import {
  Core,
  EdgeDefinition,
  NodeDefinition,
  Stylesheet
} from 'cytoscape';
import { noop, orderBy, range } from 'lodash';

import {
  EdgeType,
  NodeDisplayType,
  ProteinType,
  corePeripheralLegendColors,
  edgeTypeDisplayNames
} from '../utils/clusterGraph';
import {
  EcNumberEntry,
  EdgeEntry,
  GroupLayout,
  NodeEntry,
  PfamDomainEntry
} from '../utils/groupLayout';
import { TaxonUiMetadata } from '../utils/taxons';

const MAX_PIE_SLICES = 16;

interface CyEffectCallback {
  (cy: Core): (void | (() => void | undefined));
};

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

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  eValue: number;
  score: number;
}

export function useCytoscapeConfig(
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

export function useCyEffect(
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
          'width': 15,
          'height': 15,
          'border-color': 'black',
          'border-width': 1,
          'z-index-compare': 'manual',
          'z-index': 2
        }
      },
      {
        selector: 'node.taxa',
        css: {
          'width': 12,
          'height': 12,
          'background-color': 'data(speciesColor)',
          'border-color': 'data(groupColor)',
          'border-width': 4
        }
      },
      {
        selector: 'node.ec-numbers',
        css: {
          'background-color': 'white',
          ...makePieStyles(ecNumberNPieSlices, 'ec')
        }
      },
      {
        selector: 'node.pfam-domains',
        css: {
          'background-color': 'white',
          ...makePieStyles(pfamDomainNPieSlices, 'pfam')
        }
      },
      {
        selector: 'node.core-peripheral',
        css: {
          'background-color': 'data(corePeripheralColor)'
        }
      },
      {
        selector: 'node.highlighted',
        css: {
          'label': 'data(id)',
          'width': 23,
          'height': 23,
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
        selector: 'node.taxa.highlighted',
        css: {
          'width': 20,
          'height': 20
        }
      },
      {
        selector: 'node.highlighted.left',
        css: {
          'text-halign': 'left'
        }
      },
      {
        selector: 'node.highlighted.right',
        css: {
          'text-halign': 'right'
        }
      },
      {
        selector: 'node.highlighted.top',
        css: {
          'text-valign': 'top',
          'text-margin-y': 5
        }
      },
      {
        selector: 'node.highlighted.bottom',
        css: {
          'text-valign': 'bottom',
          'text-margin-y': -8
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
      },
      {
        selector: 'edge.filtered-out.highlighted',
        css: {
          // FIXME: This is necessary to bypass an incorrect type definition
          // in @types/cytoscape; we should open a PR to DefinitelyTyped
          'display': 'element' as any
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
