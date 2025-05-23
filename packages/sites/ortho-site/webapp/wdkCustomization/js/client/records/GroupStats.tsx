import React from 'react';
import { RecordTable } from './SequenceRecordClasses.SequenceRecordClass';
import { RecordTableProps, WrappedComponentProps } from './Types';

import MGD_hist_img from './GroupStats_Par_Rplot.png';

export function RecordTable_GroupStats(
  props: WrappedComponentProps<RecordTableProps>
) {
  const regularRecordTable = RecordTable(props);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '2em', // only separate when side-by-side (no rowGap)
      }}
    >
      {regularRecordTable}
      <figure
        style={{
          width: 400,
        }}
      >
        <img
          alt="The histogram shows the distribution of the median percent identity cohesiveness indicator across all orthologous groups. There is a skewed distribution with a peak at 0-5% identity."
          width={400}
          height={400}
          src={MGD_hist_img}
        />
        <figcaption
          style={{
            fontSize: '90%',
          }}
        >
          The histograms show the distribution of the median percent identity
          within Core (red) and All (blue) ortholog groups.
        </figcaption>
      </figure>
    </div>
  );
}
