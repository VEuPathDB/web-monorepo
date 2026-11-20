import React from 'react';

import Attribute from './Attribute';

export type DatasetSummaryProps = {
  readonly summary: string;
};

export const DatasetSummary = ({ summary }: DatasetSummaryProps) => (
  <Attribute label="Summary">
    {summary.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ))}
  </Attribute>
);