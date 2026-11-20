import React from 'react';

import Attribute from './Attribute';

export type DatasetNameProps = {
  readonly datasetName: string;
  readonly attributeLabel: string;
};

export const DatasetName = (props: DatasetNameProps) => (
  <Attribute label={props.attributeLabel} className="name">
    {props.datasetName}
  </Attribute>
);