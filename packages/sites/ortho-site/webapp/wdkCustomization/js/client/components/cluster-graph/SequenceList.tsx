import React, { useMemo } from 'react';

import { MesaColumn } from 'wdk-client/Core/CommonTypes';

import { GraphInformationDataTable } from './GraphInformationDataTable';

import {
  GraphInformationTabProps,
  SequenceListRow,
  layoutToSequenceListRows,
  GraphInformationCellRenderer,
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
      />
    </div>
  );
}

const accessionCellRenderer: GraphInformationCellRenderer<SequenceListRow, 'accession'> =
  ({ value }) => renderSequenceLink(value);

const SEQUENCE_LIST_COLUMNS: MesaColumn<keyof SequenceListRow>[] = [
  {
    key: 'accession',
    name: 'Accession',
    renderCell: accessionCellRenderer
  },
  {
    key: 'taxon',
    name: 'Taxon'
  },
  {
    key: 'length',
    name: 'Length'
  },
  {
    key: 'description',
    name: 'Description'
  }
];
