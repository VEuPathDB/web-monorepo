import React, { ReactElement } from 'react';

import Link from '@veupathdb/wdk-client/lib/Components/Link';

import Attribute from './Attribute';
import { DatasetGetResponseBody } from '../../../../Service';

export type ViewLinkProps = {
  readonly isInstalled: boolean;
  readonly dataset: DatasetGetResponseBody;
};

export const ViewLink = ({
  isInstalled,
  dataset: { datasetId, type },
}: ViewLinkProps): ReactElement =>
  !isInstalled || type.name === 'isasimple' || type.name === 'stf'
    ? <></>
    : (
    <Attribute label="View">
      <Link to={`/record/userdataset/EDAUD_${datasetId}`}>
        User dataset details
      </Link>
    </Attribute>
  );