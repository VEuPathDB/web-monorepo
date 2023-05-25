import React, { useEffect, useMemo, useState } from 'react';

import { Core, EdgeDefinition, NodeDefinition, Stylesheet } from 'cytoscape';
import { noop, orderBy } from 'lodash';

import { NodeDisplayType, ProteinType } from 'ortho-client/utils/clusterGraph';
import { addCytoscapeClasses } from 'ortho-client/utils/cytoscapeClasses';
import {
  makePieStyles,
  makeEdgeData,
  makeHAlignClass,
  makeVAlignClass,
  nodeEntryToCytoscapeData,
} from 'ortho-client/utils/cytoscapeData';
import {
  EcNumberEntry,
  GroupLayout,
  PfamDomainEntry,
} from 'ortho-client/utils/groupLayout';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

const MAX_PIE_SLICES = 16;

export type CytoscapeConfig = ReturnType<typeof useCytoscapeConfig>[0];

interface CyEffectCallback {
  (cy: Core): void | (() => void | undefined);
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
  const pfamDomainNPieSlices = Math.min(
    orderedPfamDomains.length,
    MAX_PIE_SLICES
  );

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

  const elements = useMemo(() => [...nodes, ...edges], [nodes, edges]);

  const stylesheet = useStylesheet(
    ecNumberNPieSlices,
    pfamDomainNPieSlices,
    layout.minEvalueExp,
    layout.maxEvalueExp
  );

  const initialCytoscapeConfig = {
    elements,
    stylesheet,
    layout: {
      name: 'fcose',
      animate: false,
      nodeSeparation: 500,
      idealEdgeLength: function (edge) {
        if (edge.data('score')) {
          return edge.data('score') + 500;
        }
        return 500;
      },
    },
    panningEnabled: true,
    userPanningEnabled: true,
    zoom: 1,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    boxSelectionEnabled: false,
    autoungrabify: false,
    autounselectify: true,
  };

  return useState(initialCytoscapeConfig);
}

export function useCyEffect(
  cyRef: React.MutableRefObject<Core | undefined>,
  effect: CyEffectCallback,
  deps?: React.DependencyList
) {
  useEffect(
    () => {
      if (cyRef.current == null) {
        return noop;
      }

      return effect(cyRef.current);
    },
    deps == null ? [cyRef.current] : [cyRef.current, ...deps]
  );
}

function useOrderedEcNumbers(layout: GroupLayout) {
  return useMemo(
    () =>
      orderBy(
        Object.values(layout.group.ecNumbers),
        [(ecNumber) => ecNumber.count, (ecNumber) => ecNumber.index],
        ['desc', 'asc']
      ),
    [layout]
  );
}

function useOrderedPfamDomains(layout: GroupLayout) {
  return useMemo(
    () =>
      orderBy(
        Object.values(layout.group.pfamDomains),
        [(pfamDomain) => pfamDomain.count, (pfamDomain) => pfamDomain.index],
        ['desc', 'asc']
      ),
    [layout]
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
      Object.values(layout.nodes).map((nodeEntry) => ({
        group: 'nodes',
        classes: addCytoscapeClasses(undefined, [
          selectedNodeDisplayType,
          makeHAlignClass(Number(nodeEntry.x), layout.size),
          makeVAlignClass(Number(nodeEntry.y), layout.size),
        ]),
        data: nodeEntryToCytoscapeData(
          nodeEntry,
          layout,
          corePeripheralMap,
          taxonUiMetadata,
          orderedEcNumbers,
          ecNumberNPieSlices,
          orderedPfamDomains,
          pfamDomainNPieSlices
        ),
      })),
    [layout]
  );
}

function useEdges(layout: GroupLayout): EdgeDefinition[] {
  return useMemo(
    () =>
      Object.entries(layout.edges)
        .map(
          ([edgeId, edgeEntry]) =>
            ({
              group: 'edges',
              data: makeEdgeData(edgeId, edgeEntry),
              selectable: false,
            } as const)
        )
        .sort((e1, e2) => e2.data.score - e1.data.score),
    [layout.edges]
  );
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
          shape: 'ellipse',
          width: 15,
          height: 15,
          'border-color': 'black',
          'border-width': 1,
          'z-index-compare': 'manual',
          'z-index': 2,
        },
      },
      {
        selector: 'node.taxa',
        css: {
          width: 12,
          height: 12,
          'background-color': 'data(speciesColor)',
          'border-color': 'data(groupColor)',
          'border-width': 4,
        },
      },
      {
        selector: 'node.ec-numbers',
        css: {
          'background-color': 'white',
          ...makePieStyles(ecNumberNPieSlices, 'ec'),
        },
      },
      {
        selector: 'node.pfam-domains',
        css: {
          'background-color': 'white',
          ...makePieStyles(pfamDomainNPieSlices, 'pfam'),
        },
      },
      {
        selector: 'node.core-peripheral',
        css: {
          'background-color': 'data(corePeripheralColor)',
        },
      },
      {
        selector: 'node.highlighted',
        css: {
          label: 'data(id)',
          width: 23,
          height: 23,
          'text-outline-color': 'white',
          'text-outline-width': 2,
          'text-halign': 'right',
          'text-valign': 'center',
          'text-margin-x': 2,
          'text-margin-y': -6,
          'z-index': 4,
          'font-size': 15,
          'font-weight': 'bold',
        },
      },
      {
        selector: 'node.taxa.highlighted',
        css: {
          width: 20,
          height: 20,
        },
      },
      {
        selector: 'node.highlighted.left',
        css: {
          'text-halign': 'left',
        },
      },
      {
        selector: 'node.highlighted.right',
        css: {
          'text-halign': 'right',
        },
      },
      {
        selector: 'node.highlighted.top',
        css: {
          'text-valign': 'top',
          'text-margin-y': 5,
        },
      },
      {
        selector: 'node.highlighted.bottom',
        css: {
          'text-valign': 'bottom',
          'text-margin-y': -8,
        },
      },
      {
        selector: 'edge',
        css: {
          'curve-style': 'straight',
          'line-color': `mapData(score, ${maxEvalueExp}, ${minEvalueExp}, #e9e9e9, black)`,
          width: 1,
          'z-index-compare': 'manual',
          'z-index': 1,
        },
      },
      {
        selector: 'edge.highlighted',
        css: {
          width: 3,
          label: 'data(label)',
          'text-outline-color': 'white',
          'text-outline-width': 2,
          'z-index': 3,
          'font-size': 15,
          'font-weight': 'bold',
        },
      },
      {
        selector: 'edge.type-highlighted',
        css: {
          'line-color': 'red',
        },
      },
      {
        selector: 'edge.filtered-out',
        css: {
          display: 'none',
        },
      },
      {
        selector: 'edge.filtered-out.highlighted',
        css: {
          // FIXME: This is necessary to bypass an incorrect type definition
          // in @types/cytoscape; we should open a PR to DefinitelyTyped
          display: 'element' as any,
        },
      },
    ],
    []
  );
}
