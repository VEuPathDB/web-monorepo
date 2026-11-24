import React from 'react';

import { Attribute } from './Attribute';
import { DatasetGetResponseBody } from '../../../../../Service/Model';

export type DatasetTypeProps = {
  readonly dataset: DatasetGetResponseBody;
};

export const DatasetType = ({ dataset: { type } }: DatasetTypeProps) => (
  <Attribute label="Data type">
    {type.category} ({type.name} {type.version})
  </Attribute>
);
