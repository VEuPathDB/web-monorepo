import React from 'react';

import { TabConfig } from 'wdk-client/Components/Tabs/Tabs';
import { MesaColumn } from 'wdk-client/Core/CommonTypes';

import { EdgeType } from './clusterGraph';
import { GroupLayout } from './groupLayout';

export interface GraphInformationTabProps {
  layout: GroupLayout;
  selectedNode: string | undefined;
  setSelectedNode: (newNode: string | undefined) => void;
}

export interface GraphInformationColumn<R, K extends keyof R & string = keyof R & string> extends MesaColumn<K> {
  renderCell?: (props: { value: R[K], row: R }) => React.ReactNode;
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

interface SequenceListRow {
  accession: string;
  taxon: string;
  length: number;
  description: string;
}

interface SequenceInformation {
  sourceId: string;
  length: number;
  organism: string;
  taxon: string;
  description: string;
}

interface BlastScoreRow {
  subject: string;
  type: EdgeType;
  evalue: string;
}

interface PfamDomainRow {
  accession: string;
  symbol: string;
  start: number;
  end: number;
  length: number;
}

interface EcNumberRow {
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
