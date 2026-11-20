import React from 'react';

import * as VDI from '../../../../Service/Model';

import Attribute from './Attribute';

export type DatasetTypeProps = {
  readonly type: VDI.DatasetTypeOutput;
};

export const DatasetType = ({ type }: DatasetTypeProps) => (
  <Attribute label="Data type">
    {type.category} ({type.name} {type.version})
  </Attribute>
);
