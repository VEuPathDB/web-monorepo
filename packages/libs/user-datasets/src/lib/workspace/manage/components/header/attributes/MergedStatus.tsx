import React, { ReactElement, useMemo } from 'react';

import Icon from '@veupathdb/coreui/lib/components/Mesa/Components/Icon';

import { Attribute } from './Attribute';

import { computeDatasetStatus } from '../../../../../Components/UserDatasetStatus';
import { VdiMetadata } from '../../../../../Service/utils/use-vdi';
import { DatasetGetResponseBody } from '../../../../../Service/Model';

export type UnifiedStatusProps = {
  readonly dataset: DatasetGetResponseBody,
  readonly dataNoun: string;
  readonly vdiMetadata: VdiMetadata;
};

export const UnifiedStatus = ({
  dataset: { status },
  dataNoun,
  vdiMetadata: { serviceInfo: { configuration: { daemons: { reconciler } } } },
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
