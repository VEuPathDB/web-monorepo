import React from 'react';
import { RecordTable } from './SequenceRecordClasses.SequenceRecordClass';
import { RecordTableProps, WrappedComponentProps } from './Types';

export function RecordTable_GroupStats(
  props: WrappedComponentProps<RecordTableProps>
) {
  const regularRecordTable = RecordTable(props);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
      }}
    >
      <div
        style={{
          backgroundColor: '#eee',
          height: 300,
          width: 300,
          textAlign: 'center',
          paddingTop: 75,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <p>This could be an image.</p>
        <p>
          Though I don't know how we will programmatically obtain the image{' '}
          <code>src</code>.
        </p>
        <p>
          I don't know where <code>images/eval-hist.png</code> is or what it
          looks like.
        </p>
      </div>
      {regularRecordTable}
    </div>
  );
}
