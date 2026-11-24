import React from 'react';

import * as VDI from '../../../../Service/Model';

import Attribute from './Attribute';

export type DatasetIdProps = {
  readonly datasetId: VDI.DatasetId;
};

export const DatasetId = ({ datasetId }: DatasetIdProps) => (
  <Attribute label="ID">{datasetId}</Attribute>
);