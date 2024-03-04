import React from 'react';

import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import { RecordTableProps, WrappedComponentProps } from './Types';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const ogGroupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  const mesaColumns = props.table.attributes
    .map(
      ({ name, displayName }) => ({
        key: name,
        name: displayName,
      })
      // and remove some a raw HTML checkbox field and an object-laden 'sequence_link' field
    )
    .filter(({ key }) => key !== 'clustalInput' && key !== 'sequence_link');

  const mesaRows = props.value;

  const mesaState = {
    options: {},
    rows: mesaRows,
    columns: mesaColumns,
  };

  return (
    <>
      <ul>
        <li>displayName: {props.record.displayName}</li>
        <li>group_name id: {ogGroupName}</li>
      </ul>
      <Mesa state={mesaState} />
    </>
  );
}
