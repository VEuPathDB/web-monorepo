import React, { useCallback, useMemo } from 'react';

import { GraphInformationDataTable } from './GraphInformationDataTable';

import {
  GraphInformationColumns,
  GraphInformationTabProps,
  SequenceListRow,
  layoutToSequenceListRows,
  renderSequenceLink
} from '../../utils/graphInformation';

export function SequenceList({ layout, setHighlightedSequenceNodeId }: GraphInformationTabProps) {
  const rows = useMemo(
    () => layoutToSequenceListRows(layout),
    [ layout ]
  );

  const onSequenceRowMouseOver = useCallback(
    (row: SequenceListRow) => {
      setHighlightedSequenceNodeId(row.accession);
    },
    [ setHighlightedSequenceNodeId ]
  );

  const onSequenceRowMouseLeave = useCallback(
    () => {
      setHighlightedSequenceNodeId(undefined);
    },
    [ setHighlightedSequenceNodeId ]
  );

  return (
    <div className="SequenceList">
      <GraphInformationDataTable
        rows={rows}
        columns={SEQUENCE_LIST_COLUMNS}
        columnOrder={SEQUENCE_LIST_COLUMN_ORDER}
        onRowMouseOver={onSequenceRowMouseOver}
        onRowMouseLeave={onSequenceRowMouseLeave}
      />
    </div>
  );
}

const SEQUENCE_LIST_COLUMNS: GraphInformationColumns<SequenceListRow, 'accession' | 'taxon' | 'length' | 'description'> = {
  accession: {
    key: 'accession',
    name: 'Accession',
    sortable: true,
    renderCell: ({ value }) => renderSequenceLink(value)
  },
  taxon: {
    key: 'taxon',
    name: 'Taxon',
    sortable: true
  },
  length: {
    key: 'length',
    name: 'Length',
    sortable: true
  },
  description: {
    key: 'description',
    name: 'Description',
    sortable: true
  }
};

const SEQUENCE_LIST_COLUMN_ORDER = [ 'accession', 'taxon', 'length', 'description' ] as const;
