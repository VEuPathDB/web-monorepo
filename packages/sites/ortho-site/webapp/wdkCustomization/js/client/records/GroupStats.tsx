import React, { useEffect, useRef, useState } from 'react';
import { RecordTable } from './SequenceRecordClasses.SequenceRecordClass';
import { RecordTableProps, WrappedComponentProps } from './Types';

import eval_hist_img from '../../../images/eval-hist.png';

export function RecordTable_GroupStats(
  props: WrappedComponentProps<RecordTableProps>
) {
  const regularRecordTable = RecordTable(props);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgWidth, setImgWidth] = useState(0);

  useEffect(() => {
    setImgWidth(imgRef.current?.offsetWidth ?? 0);
  }, [imgRef]);

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
          width: imgWidth || undefined,
        }}
      >
        <img
          alt="Histogram of median inter-group e-values for both core-only and core+peripheral proteins. The distributions of both peak at around 1e-20 to 1e-60 with a substantial tail out to e-values of 1e-300."
          src={eval_hist_img}
          ref={imgRef}
          onLoad={() => setImgWidth(imgRef.current?.offsetWidth ?? 0)}
        />
        {imgWidth ? ( // only render the caption after the image is fully loaded so it doesn't shape-shift
          <figcaption
            style={{
              fontSize: '90%',
            }}
          >
            This histogram is provided to aid the interpretation of E-values in
            the adjoining table. E-values have been transformed using a negative
            logarithm, so higher significance is represented further to the
            right.
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
