import React from 'react';

import { Attribute } from './Attribute';

export type DatasetDescriptionProps = {
  readonly description?: string;
};

export const DatasetDescription = ({ description }: DatasetDescriptionProps) => (
  <Attribute label="Description">
    {description?.split('\n')?.map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ))}
  </Attribute>
);