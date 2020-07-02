import React, { useMemo } from 'react';

import {
  BlastScoreRow,
  EcNumberRow,
  GraphInformationColumns,
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
                  columnOrder={BLAST_SCORE_COLUMN_ORDER}
                />
              </GraphAccordion>
              <GraphAccordion title="PFam Domains">
                <GraphInformationDataTable
                  rows={nodeDetails.pfamDomainRows}
                  columns={PFAM_DOMAIN_COLUMNS}
                  columnOrder={PFAM_DOMAIN_COLUMN_ORDER}
                />
              </GraphAccordion>
              <GraphAccordion title="EC Numbers">
                <GraphInformationDataTable
                  rows={nodeDetails.ecNumberRows}
                  columns={EC_NUMBER_COLUMNS}
                  columnOrder={EC_NUMBER_COLUMN_ORDER}
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

const BLAST_SCORE_COLUMNS: GraphInformationColumns<BlastScoreRow, 'subject' | 'type' | 'evalue'> = {
  subject: {
    key: 'subject',
    name: 'Subject',
    sortable: true,
    renderCell: ({ value }) => renderSequenceLink(value)
  },
  type: {
    key: 'type',
    name: 'Type',
    sortable: true,
    makeOrder: ({ type }) => renderEdgeType(type),
    makeSearchableString: value => renderEdgeType(value),
    renderCell: ({ value }) => renderEdgeType(value)
  },
  evalue: {
    key: 'evalue',
    name: 'Evalue',
    sortable: true,
    makeOrder: ({ evalue }) => Number(evalue)
  }
};

const BLAST_SCORE_COLUMN_ORDER = [ 'subject', 'type', 'evalue' ] as const;

const PFAM_DOMAIN_COLUMNS: GraphInformationColumns<PfamDomainRow, 'accession' | 'symbol' | 'start' | 'end' | 'length'> = {
  accession: {
    key: 'accession',
    name: 'Accession',
    sortable: true
  },
  symbol: {
    key: 'symbol',
    name: 'Symbol',
    sortable: true
  },
  start: {
    key: 'start',
    name: 'Start',
    sortable: true
  },
  end: {
    key: 'end',
    name: 'End',
    sortable: true
  },
  length: {
    key: 'length',
    name: 'Length',
    sortable: true
  }
};

const PFAM_DOMAIN_COLUMN_ORDER = [ 'accession', 'symbol', 'start', 'end', 'length' ] as const;

export const EC_NUMBER_COLUMNS: GraphInformationColumns<EcNumberRow, 'ecNumber'> = {
  ecNumber: {
    key: 'ecNumber',
    name: 'EC Number',
    sortable: true,
    makeOrder: ({ index }) => index
  }
};

const EC_NUMBER_COLUMN_ORDER = [ 'ecNumber' ] as const;
