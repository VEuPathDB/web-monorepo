import React from 'react';

import Attribute from './Attribute';
import { DatasetGetResponseBody } from '../../../../Service';

export type DatasetSummaryProps = {
  readonly dataset: DatasetGetResponseBody;
};

export const DatasetSummary = ({ dataset: { summary } }: DatasetSummaryProps) => (
  <Attribute label="Summary">
    {summary.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ))}
  </Attribute>
);