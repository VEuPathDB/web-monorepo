import React from 'react';

import * as VDI from '../../../../Service/Model';

import Attribute from './Attribute';
import { datasetUserFullName } from '../../../../Utils';

export type DatasetUploaderProps = {
  readonly user: VDI.DatasetUser;
  readonly isOwner: boolean;
};

export const DatasetUploader = ({ user, isOwner }: DatasetUploaderProps) => (
  <Attribute label="Uploaded by">
    {isOwner ? 'Me' : datasetUserFullName(user)}
  </Attribute>
);
