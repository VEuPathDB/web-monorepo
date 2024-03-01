import React from 'react';

import { RecordTableProps, WrappedComponentProps } from './Types';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const ogGroupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  const tables = Object.keys(props.record.tables).join(' + ');
  // EcNumber + Sequences + TaxonCounts + ProteinPFams + PFams + Statistics

  const sequences = props.record.tables['Sequences'];
  const firstRow = sequences[0];

  const sequenceT = props.recordClass.tables.find(
    (table) => table.name === 'Sequences'
  );
  const attributes = sequenceT?.attributes;
  return (
    <ul>
      <li>displayName: {props.record.displayName}</li>
      <li>group_name id: {ogGroupName}</li>
      <li>tables keys: {tables}</li>
      <li>attributes of Sequences: {JSON.stringify(attributes)}</li>
      <li>first row of Sequences: {JSON.stringify(firstRow)}</li>
    </ul>
  );
}
