import React, { useMemo } from 'react';

import { MesaColumn } from 'wdk-client/Core/CommonTypes';

import {
  BlastScoreRow,
  EcNumberRow,
  GraphInformationCellRenderer,
  GraphInformationTabProps,
  PfamDomainRow,
  SequenceInformation,
  layoutAndAccessionToBlastScoreRows,
  layoutAndAccessionToEcNumberRows,
  layoutAndAccessionToSequenceInformation,
  layoutAndAccessionToPfamDomainRows,
  renderEdgeType,
  renderSequenceLink
} from '../../utils/graphInformation';
import { GroupLayout } from '../../utils/groupLayout';

import { GraphAccordion } from './GraphAccordion';
import { GraphInformationDataTable } from './GraphInformationDataTable';

export function NodeDetails({ layout, selectedNode }: GraphInformationTabProps) {
  const nodeDetails = useNodeDetails(layout, selectedNode);

  return (
    <div className="NodeDetails">
      {
        nodeDetails == null
          ? <h2 className="NoNodeSelected">Click a node to see details</h2>
          : <React.Fragment>
              <div className="NodeDetailsHeader">
                {selectedNode}
              </div>
              <GraphAccordion title="Sequence Information">
                <SequenceInformationTable {...nodeDetails.sequenceInformation} />
              </GraphAccordion>
              <GraphAccordion title="BLAST Scores">
                <GraphInformationDataTable
                  rows={nodeDetails.blastScoreRows}
                  columns={BLAST_SCORE_COLUMNS}
                />
              </GraphAccordion>
              <GraphAccordion title="PFam Domains">
                <GraphInformationDataTable
                  rows={nodeDetails.pfamDomainRows}
                  columns={PFAM_DOMAIN_COLUMNS}
                />
              </GraphAccordion>
              <GraphAccordion title="EC Numbers">
                <GraphInformationDataTable
                  rows={nodeDetails.ecNumberRows}
                  columns={EC_NUMBER_COLUMNS}
                />
              </GraphAccordion>
            </React.Fragment>
      }
    </div>
  );
}

function useNodeDetails(layout: GroupLayout, accession: string | undefined) {
  return useMemo(
    () => accession == null
      ? undefined
      : ({
          sequenceInformation: layoutAndAccessionToSequenceInformation(layout, accession),
          blastScoreRows: layoutAndAccessionToBlastScoreRows(layout, accession),
          pfamDomainRows: layoutAndAccessionToPfamDomainRows(layout, accession),
          ecNumberRows: layoutAndAccessionToEcNumberRows(layout, accession),
        }),
    [ layout, accession ]
  );
}

function SequenceInformationTable(props: SequenceInformation) {
  return (
    <table className="SequenceInformation">
      <tbody>
        <tr>
          <th>Source ID:</th>
          <td>{props.sourceId}</td>
          <th>Length:</th>
          <td>{props.length}</td>
        </tr>
        <tr>
          <th>Organism:</th>
          <td>{props.organism}</td>
          <th>Taxon:</th>
          <td>{props.taxon}</td>
        </tr>
        <tr>
          <th>Description:</th>
          <td colSpan={3}>{props.description}</td>
        </tr>
      </tbody>
    </table>
  );
}

const subjectCellRenderer: GraphInformationCellRenderer<BlastScoreRow, 'subject'> =
  ({ value }) => renderSequenceLink(value);

const edgeTypeRenderer: GraphInformationCellRenderer<BlastScoreRow, 'type'> =
  ({ value }) => renderEdgeType(value);

const BLAST_SCORE_COLUMNS: MesaColumn<keyof BlastScoreRow>[] = [
  {
    key: 'subject',
    name: 'Subject',
    renderCell: subjectCellRenderer
  },
  {
    key: 'type',
    name: 'Type',
    renderCell: edgeTypeRenderer
  },
  {
    key: 'evalue',
    name: 'Evalue'
  }
];

const PFAM_DOMAIN_COLUMNS: MesaColumn<keyof PfamDomainRow>[] = [
  {
    key: 'accession',
    name: 'Accession'
  },
  {
    key: 'symbol',
    name: 'Symbol'
  },
  {
    key: 'start',
    name: 'Start'
  },
  {
    key: 'end',
    name: 'End'
  },
  {
    key: 'length',
    name: 'Length'
  }
];

export const EC_NUMBER_COLUMNS: MesaColumn<keyof EcNumberRow>[] = [
  {
    key: 'ecNumber',
    name: 'EC Number'
  }
];
