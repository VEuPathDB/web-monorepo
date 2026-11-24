import React, { ReactElement, useMemo } from 'react';

import Icon from '@veupathdb/coreui/lib/components/Mesa/Components/Icon';

import Attribute from './Attribute';

import { computeDatasetStatus } from '../../../../Components/UserDatasetStatus';
import { DatasetGetResponseBody, VdiServiceMetadata } from '../../../../Service';

export type UnifiedStatusProps = {
  readonly dataset: DatasetGetResponseBody,
  readonly dataNoun: string;
  readonly vdiMetadata: VdiServiceMetadata;
};

export const UnifiedStatus = ({
  dataset: { status },
  dataNoun,
  vdiMetadata: { configuration: { daemons: { reconciler } } },
}: UnifiedStatusProps): ReactElement => {
  const statusContent = useMemo(
    () => computeDatasetStatus(status, dataNoun, reconciler),
    [status, reconciler, dataNoun]
  );

  return (
    <Attribute label="Status">
      <Icon className="StatusIcon" fa={statusContent?.icon} />
      {statusContent?.content}
    </Attribute>
  )
};
