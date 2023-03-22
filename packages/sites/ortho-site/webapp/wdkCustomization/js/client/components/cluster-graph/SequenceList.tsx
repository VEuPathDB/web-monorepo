import React, { useCallback, useMemo } from 'react';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';

import { DataTableColumns } from 'ortho-client/utils/dataTables';
import {
  GraphInformationTabProps,
  SequenceListRow,
  layoutToSequenceListRows,
  renderSequenceLink
} from 'ortho-client/utils/graphInformation';

const TABLE_BODY_MAX_HEIGHT = '625px';

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

  const onSequenceRowMouseOut = useCallback(
    () => {
      setHighlightedSequenceNodeId(undefined);
    },
    [ setHighlightedSequenceNodeId ]
  );

  return (
    <div className="SequenceList">
      <OrthoDataTable
        rows={rows}
        columns={SEQUENCE_LIST_COLUMNS}
        columnOrder={SEQUENCE_LIST_COLUMN_ORDER}
        onRowMouseOver={onSequenceRowMouseOver}
        onRowMouseOut={onSequenceRowMouseOut}
        tableBodyMaxHeight={TABLE_BODY_MAX_HEIGHT}
      />
    </div>
  );
}

const SEQUENCE_LIST_COLUMNS: DataTableColumns<SequenceListRow, 'accession' | 'taxon' | 'length' | 'description'> = {
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
