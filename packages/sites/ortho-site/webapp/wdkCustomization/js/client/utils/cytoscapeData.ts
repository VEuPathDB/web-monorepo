import { range } from 'lodash';

import {
  EdgeType,
  ProteinType,
  corePeripheralLegendColors,
  edgeTypeDisplayNames,
} from 'ortho-client/utils/clusterGraph';
import {
  EcNumberEntry,
  EdgeEntry,
  GroupLayout,
  NodeEntry,
  PfamDomainEntry,
} from 'ortho-client/utils/groupLayout';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

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

export function nodeEntryToCytoscapeData(
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
    corePeripheralColor: nodeEntryToCorePeripheralColor(
      nodeEntry,
      layout,
      corePeripheralMap
    ),
    ...nodeEntryToTaxonColors(nodeEntry, layout, taxonUiMetadata),
    ...nodeEntryToEcNumberPieData(
      nodeEntry,
      layout,
      orderedEcNumbers,
      ecNumberNPieSlices
    ),
    ...nodeEntryToPfamDomainPieData(
      nodeEntry,
      layout,
      orderedPfamDomains,
      pfamDomainNPieSlices
    ),
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
    speciesColor: nodeSpecies.color,
  };
}

function nodeEntryToEcNumberPieData(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  orderedEcNumbers: EcNumberEntry[],
  ecNumberNPieSlices: number
) {
  const nodeEcNumbers = genes[nodeEntry.id].ecNumbers;

  const ecPieColors = orderedEcNumbers
    .slice(0, ecNumberNPieSlices)
    .map((ecNumber) =>
      nodeEcNumbers.includes(ecNumber.code) ? ecNumber.color : 'white'
    );

  return {
    ecPieColors,
    ecPieSliceSize: `${100 / ecNumberNPieSlices}%`,
  };
}

function nodeEntryToPfamDomainPieData(
  nodeEntry: NodeEntry,
  { group: { genes } }: GroupLayout,
  orderedPfamDomains: PfamDomainEntry[],
  pfamDomainNPieSlices: number
) {
  const nodePfamDomains = Object.keys(genes[nodeEntry.id].pfamDomains);

  const pfamPieColors = orderedPfamDomains
    .slice(0, pfamDomainNPieSlices)
    .map((pfamDomain) =>
      nodePfamDomains.includes(pfamDomain.accession)
        ? pfamDomain.color
        : 'white'
    );

  return {
    pfamPieColors,
    pfamPieSliceSize: `${100 / pfamDomainNPieSlices}%`,
  };
}

export function makeEdgeData(edgeId: string, edgeEntry: EdgeEntry): EdgeData {
  return {
    id: edgeId,
    source: edgeEntry.queryId,
    target: edgeEntry.subjectId,
    type: edgeEntry.T,
    label: `${edgeTypeDisplayNames[edgeEntry.T]}, evalue=${edgeEntry.E}`,
    eValue: Number(edgeEntry.E),
    score: edgeEntry.score,
  };
}

export function makePieStyles(nPieSlices: number, dataPrefix: string) {
  const sliceStyles = range(0, nPieSlices).reduce(
    (memo, i) => ({
      ...memo,
      [`pie-${i + 1}-background-color`]: `data(${dataPrefix}PieColors.${i})`,
      [`pie-${i + 1}-background-size`]: `data(${dataPrefix}PieSliceSize)`,
    }),
    {}
  );

  return {
    'pie-size': '100%',
    ...sliceStyles,
  };
}

export function makeHAlignClass(xCoord: number, canvasWidth: number) {
  return xCoord <= canvasWidth / 2 ? 'right' : 'left';
}

export function makeVAlignClass(yCoord: number, canvasHeight: number) {
  return yCoord <= canvasHeight / 2 ? 'bottom' : 'top';
}
