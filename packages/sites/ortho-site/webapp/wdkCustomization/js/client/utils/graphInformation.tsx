import React from 'react';

import { Link } from 'wdk-client/Components';
import { TabConfig } from 'wdk-client/Components/Tabs/Tabs';

import { EdgeType, edgeTypeDisplayNames } from './clusterGraph';
import { GroupLayout } from './groupLayout';

export interface GraphInformationTabProps {
  layout: GroupLayout;
  selectedNode: string | undefined;
  setSelectedNode: (newNode: string | undefined) => void;
}

export interface GraphInformationCellRenderer<R, K extends keyof R> {
  (props: { row: R, value: R[K] }): React.ReactNode;
}

export type GraphInformationTabKey = 'sequence-list' | 'node-details';

type GraphInformationBaseTabConfig = Omit<TabConfig<GraphInformationTabKey>, 'content'>;

export const graphInformationBaseTabConfigs: GraphInformationBaseTabConfig[] = [
  {
    key: 'sequence-list',
    display: 'Sequence List',
  },
  {
    key: 'node-details',
    display: 'Node Details'
  }
];

export interface SequenceListRow {
  accession: string;
  taxon: string;
  length: number;
  description: string;
}

export interface SequenceInformation {
  sourceId: string;
  length: number;
  organism: string;
  taxon: string;
  description: string;
}

export interface BlastScoreRow {
  subject: string;
  type: EdgeType;
  evalue: string;
}

export interface PfamDomainRow {
  accession: string;
  symbol: string;
  start: number;
  end: number;
  length: number;
}

export interface EcNumberRow {
  ecNumber: string;
  index: number;
}

export function layoutToSequenceListRows(layout: GroupLayout): SequenceListRow[] {
  return Object.entries(layout.group.genes).map(
    ([ accession, geneEntry ]) => ({
      accession,
      taxon: geneEntry.taxon.abbrev,
      length: geneEntry.length,
      description: geneEntry.description
    })
  );
}

export function layoutAndAccessionToSequenceInformation(layout: GroupLayout, accession: string): SequenceInformation {
  const geneEntry = layout.group.genes[accession];

  return {
    sourceId: accession,
    length: geneEntry.length,
    organism: geneEntry.taxon.name,
    taxon: geneEntry.taxon.abbrev,
    description: geneEntry.description
  };
}

export function layoutAndAccessionToBlastScoreRows(layout: GroupLayout, accession: string): BlastScoreRow[] {
  return (
    Object.values(layout.edges)
      .filter(edge => edge.queryId === accession)
      .map(
        edge => ({
          subject: edge.subjectId,
          type: edge.T,
          evalue: edge.E
        })
      )
  );
}

export function layoutAndAccessionToPfamDomainRows(layout: GroupLayout, accession: string): PfamDomainRow[] {
  return Object.entries(layout.group.genes[accession].pfamDomains).map(
    ([ domainAccession, [ start, end, length ] ]) => ({
      accession: domainAccession,
      symbol: layout.group.pfamDomains[domainAccession].symbol,
      start,
      end,
      length
    })
  );
}

export function layoutAndAccessionToEcNumberRows(layout: GroupLayout, accession: string): EcNumberRow[] {
  return layout.group.genes[accession].ecNumbers.map(
    ecNumber => ({
      ecNumber,
      index: layout.group.ecNumbers[ecNumber].index
    })
  );
}

export function renderSequenceLink(accession: string) {
  return <Link to={`/record/sequence/${accession}`}>{accession}</Link>
}

export function renderEdgeType(edgeType: EdgeType) {
  return edgeTypeDisplayNames[edgeType];
}
