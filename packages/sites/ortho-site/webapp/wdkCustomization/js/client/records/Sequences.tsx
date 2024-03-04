import React from 'react';

import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { useOrthoService } from 'ortho-client/hooks/orthoService';

export function RecordTable_Sequences(
  props: WrappedComponentProps<RecordTableProps>
) {
  const groupName = props.record.id.find(
    ({ name }) => name === 'group_name'
  )?.value;

  if (!groupName) {
    throw new Error('groupName is required but was not found in the record.');
  }

  const treeResponse = useOrthoService(
    (orthoService) => orthoService.getGroupTree(groupName),
    [groupName]
  );

  const mesaColumns = props.table.attributes
    .map(({ name, displayName }) => ({
      key: name,
      name: displayName,
    }))
    // and remove a raw HTML checkbox field - we'll use Mesa's built-in checkboxes for this
    // and an object-laden 'sequence_link' field - the ID seems to be replicated in the full_id field
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
        <li>group_name id: {groupName}</li>
      </ul>
      <Mesa state={mesaState} />
    </>
  );
}
