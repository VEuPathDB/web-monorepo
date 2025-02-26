import React from 'react';
import { RecordTable } from './SequenceRecordClasses.SequenceRecordClass';
import { RecordTableProps, WrappedComponentProps } from './Types';

import MGD_hist_img from './MGD-hist.png';

export function RecordTable_GroupStats(
  props: WrappedComponentProps<RecordTableProps>
) {
  const regularRecordTable = RecordTable(props);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {regularRecordTable}
      <figure
        style={{
          width: 390,
        }}
      >
        <img
          alt="The histogram shows the distribution of the median percent identity cohesiveness indicator across all orthologous groups. There is a skewed distribution with a peak at 0-5% identity."
          width={390}
          height={336}
          src={MGD_hist_img}
        />
        <figcaption
          style={{
            fontSize: '90%',
          }}
        >
          The histogram shows the distribution of the median percent identity
          cohesiveness indicator across all orthologous groups.
        </figcaption>
      </figure>
    </div>
  );
}
