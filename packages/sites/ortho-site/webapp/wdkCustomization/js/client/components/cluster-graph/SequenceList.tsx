import React, { useMemo } from 'react';

import { GraphInformationDataTable } from './GraphInformationDataTable';

import {
  GraphInformationColumns,
  GraphInformationTabProps,
  SequenceListRow,
  layoutToSequenceListRows,
  renderSequenceLink
} from '../../utils/graphInformation';

export function SequenceList({ layout }: GraphInformationTabProps) {
  const rows = useMemo(
    () => layoutToSequenceListRows(layout),
    [ layout ]
  );

  return (
    <div className="SequenceList">
      <GraphInformationDataTable
        rows={rows}
        columns={SEQUENCE_LIST_COLUMNS}
        columnOrder={SEQUENCE_LIST_COLUMN_ORDER}
      />
    </div>
  );
}

const SEQUENCE_LIST_COLUMNS: GraphInformationColumns<SequenceListRow, 'accession' | 'taxon' | 'length' | 'description'> = {
  accession: {
    key: 'accession',
    name: 'Accession',
    renderCell: ({ value }) => renderSequenceLink(value)
  },
  taxon: {
    key: 'taxon',
    name: 'Taxon'
  },
  length: {
    key: 'length',
    name: 'Length'
  },
  description: {
    key: 'description',
    name: 'Description'
  }
};

const SEQUENCE_LIST_COLUMN_ORDER = [ 'accession', 'taxon', 'length', 'description' ] as const;
