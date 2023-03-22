import React, { useCallback, useMemo } from 'react';

import { DataTableColumns } from 'ortho-client/utils/dataTables';
import {
  BlastScoreRow,
  EcNumberRow,
  GraphInformationTabProps,
  PfamDomainRow,
  SequenceInformation,
  layoutAndAccessionToBlastScoreRows,
  layoutAndAccessionToEcNumberRows,
  layoutAndAccessionToSequenceInformation,
  layoutAndAccessionToPfamDomainRows,
  renderEdgeType,
  renderSequenceLink
} from 'ortho-client/utils/graphInformation';
import { GroupLayout } from 'ortho-client/utils/groupLayout';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import { GraphAccordion } from 'ortho-client/components/cluster-graph/GraphAccordion';

import './NodeDetails.scss';

const TABLE_BODY_MAX_HEIGHT = 'min(33vh, 625px)';

export function NodeDetails({
  layout,
  selectedNode,
  setHighlightedBlastEdgeId
}: GraphInformationTabProps) {
  const nodeDetails = useNodeDetails(layout, selectedNode);

  const onBlastRowMouseOver = useCallback(
    (row: BlastScoreRow) => {
      setHighlightedBlastEdgeId(row.edgeId);
    },
    [ setHighlightedBlastEdgeId ]
  );

  const onBlastRowMouseOut = useCallback(
    () => {
      setHighlightedBlastEdgeId(undefined);
    },
    [ setHighlightedBlastEdgeId ]
  );

  return (
    <div className="NodeDetails">
      {
        nodeDetails == null
          ? <h2 className="NoNodeSelected">Click a node to see details</h2>
          : <React.Fragment>
              <h2 className="NodeDetailsHeader">
                {selectedNode}
              </h2>
              <GraphAccordion title="Sequence Information">
                <SequenceInformationTable {...nodeDetails.sequenceInformation} />
              </GraphAccordion>
              <GraphAccordion title="BLAST Scores">
                <OrthoDataTable
                  rows={nodeDetails.blastScoreRows}
                  columns={BLAST_SCORE_COLUMNS}
                  columnOrder={BLAST_SCORE_COLUMN_ORDER}
                  onRowMouseOver={onBlastRowMouseOver}
                  onRowMouseOut={onBlastRowMouseOut}
                  tableBodyMaxHeight={TABLE_BODY_MAX_HEIGHT}
                />
              </GraphAccordion>
              <GraphAccordion title="PFam Domains">
                <OrthoDataTable
                  rows={nodeDetails.pfamDomainRows}
                  columns={PFAM_DOMAIN_COLUMNS}
                  columnOrder={PFAM_DOMAIN_COLUMN_ORDER}
                  tableBodyMaxHeight={TABLE_BODY_MAX_HEIGHT}
                />
              </GraphAccordion>
              <GraphAccordion title="EC Numbers">
                <OrthoDataTable
                  rows={nodeDetails.ecNumberRows}
                  columns={EC_NUMBER_COLUMNS}
                  columnOrder={EC_NUMBER_COLUMN_ORDER}
                  tableBodyMaxHeight={TABLE_BODY_MAX_HEIGHT}
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

const BLAST_SCORE_COLUMNS: DataTableColumns<BlastScoreRow, 'subject' | 'type' | 'evalue'> = {
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

const PFAM_DOMAIN_COLUMNS: DataTableColumns<PfamDomainRow, 'accession' | 'symbol' | 'start' | 'end' | 'length'> = {
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

export const EC_NUMBER_COLUMNS: DataTableColumns<EcNumberRow, 'ecNumber' | 'description'> = {
  ecNumber: {
    key: 'ecNumber',
    name: 'EC Number',
    sortable: true,
    makeOrder: ({ index }) => index
  },
  description: {
    key: 'description',
    name: 'Description',
    sortable: true,
  }
};

const EC_NUMBER_COLUMN_ORDER = [ 'ecNumber', 'description' ] as const;
