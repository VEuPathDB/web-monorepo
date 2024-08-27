import React from 'react';
import { RecordTable } from './SequenceRecordClasses.SequenceRecordClass';
import { RecordTableProps, WrappedComponentProps } from './Types';

import eval_hist_img from './eval-hist.png';

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
      {regularRecordTable}
      <figure
        style={{
          width: 480,
        }}
      >
        <img
          alt="Histogram of median inter-group e-values for both core-only and core+peripheral proteins. The distributions of both peak at around 1e-20 to 1e-60 with a substantial tail out to e-values of 1e-300."
          width={480}
          height={480}
          src={eval_hist_img}
        />
        <figcaption
          style={{
            fontSize: '90%',
          }}
        >
          This histogram is provided to aid the interpretation of E-values in
          the adjoining table. E-values have been transformed using a negative
          logarithm, so higher significance is represented further to the right.
        </figcaption>
      </figure>
    </div>
  );
}
