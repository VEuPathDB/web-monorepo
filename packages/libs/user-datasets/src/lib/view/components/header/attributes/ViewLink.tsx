import React from 'react';

import Link from '@veupathdb/wdk-client/lib/Components/Link';

import * as VDI from '../../../../Service/Model';

import Attribute from './Attribute';

export type ViewLinkProps = {
  readonly datasetId: VDI.DatasetId;
};

export const ViewLink = ({ datasetId }: ViewLinkProps) => (
  <Attribute label="View">
    <Link to={`/record/userdataset/EDAUD_${datasetId}`}>
      User dataset details
    </Link>
  </Attribute>
);