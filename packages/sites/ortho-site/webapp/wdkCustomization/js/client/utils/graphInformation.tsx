import React from 'react';

import { Link, WDKClientTooltip } from '@veupathdb/wdk-client/lib/Components';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { TabConfig } from '@veupathdb/wdk-client/lib/Components/Tabs/Tabs';

import {
  EdgeType,
  NODE_DETAILS_HELP,
  SEQUENCE_LIST_HELP,
  edgeTypeDisplayNames,
} from 'ortho-client/utils/clusterGraph';
import { GroupLayout } from 'ortho-client/utils/groupLayout';

export type GraphInformationTabKey = 'sequence-list' | 'node-details';

export interface GraphInformationTabProps {
  layout: GroupLayout;
  selectedNode: string | undefined;
  setHighlightedSequenceNodeId: (nodeId: string | undefined) => void;
  setHighlightedBlastEdgeId: (nodeId: string | undefined) => void;
}

type GraphInformationBaseTabConfig = Omit<
  TabConfig<GraphInformationTabKey>,
  'content'
>;

export const graphInformationBaseTabConfigs: GraphInformationBaseTabConfig[] = [
  {
    key: 'sequence-list',
    display: (
      <div>
        Sequence List
        <WDKClientTooltip content={SEQUENCE_LIST_HELP}>
          <div className="HelpTrigger">
            <Icon fa="question-circle" />
          </div>
        </WDKClientTooltip>
      </div>
    ),
  },
  {
    key: 'node-details',
    display: (
      <div>
        Node Details
        <WDKClientTooltip content={NODE_DETAILS_HELP}>
          <div className="HelpTrigger">
            <Icon fa="question-circle" />
          </div>
        </WDKClientTooltip>
      </div>
    ),
  },
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
  edgeId: string;
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
  description: string;
  index: number;
}

export function layoutToSequenceListRows(
  layout: GroupLayout
): SequenceListRow[] {
  return Object.entries(layout.group.genes).map(([accession, geneEntry]) => ({
    accession,
    taxon: geneEntry.taxon.abbrev,
    length: geneEntry.length,
    description: geneEntry.description,
  }));
}

export function layoutAndAccessionToSequenceInformation(
  layout: GroupLayout,
  accession: string
): SequenceInformation {
  const geneEntry = layout.group.genes[accession];

  return {
    sourceId: accession,
    length: geneEntry.length,
    organism: geneEntry.taxon.name,
    taxon: geneEntry.taxon.abbrev,
    description: geneEntry.description,
  };
}

export function layoutAndAccessionToBlastScoreRows(
  layout: GroupLayout,
  accession: string
): BlastScoreRow[] {
  return Object.entries(layout.edges)
    .filter(
      ([_, edgeEntry]) =>
        edgeEntry.queryId === accession || edgeEntry.subjectId === accession
    )
    .map(([edgeId, edgeEntry]) => ({
      edgeId,
      subject:
        edgeEntry.queryId === accession
          ? edgeEntry.subjectId
          : edgeEntry.queryId,
      type: edgeEntry.T,
      evalue: edgeEntry.E,
    }));
}

export function layoutAndAccessionToPfamDomainRows(
  layout: GroupLayout,
  accession: string
): PfamDomainRow[] {
  return Object.entries(layout.group.genes[accession].pfamDomains).map(
    ([domainAccession, [start, end, length]]) => ({
      accession: domainAccession,
      symbol: layout.group.pfamDomains[domainAccession].symbol,
      start,
      end,
      length,
    })
  );
}

export function layoutAndAccessionToEcNumberRows(
  layout: GroupLayout,
  accession: string
): EcNumberRow[] {
  return layout.group.genes[accession].ecNumbers.map((ecNumber) => ({
    ecNumber,
    index: layout.group.ecNumbers[ecNumber].index,
    description: layout.group.ecNumbers[ecNumber].description,
  }));
}

export function renderSequenceLink(accession: string) {
  return <Link to={`/record/sequence/${accession}`}>{accession}</Link>;
}

export function renderEdgeType(edgeType: EdgeType) {
  return edgeTypeDisplayNames[edgeType];
}
