import React from 'react';
import Lodash from 'lodash';

import Icon from '@veupathdb/coreui/lib/components/Mesa/Components/Icon';

import Attribute from './Attribute';
import State from '../../../ManagementViewStore';

import * as Utils from '../../../../Utils';
import * as VDI from '../../../../Service';

import { projectId } from '../../../../config';
import { useSelector } from 'react-redux';
import { computeDatasetStatus } from '../../../../Components/UserDatasetStatus';
import { useVdiMetadata } from '../../../../Service/vdi-hooks';

export type UnifiedStatusProps = {
  readonly dataNoun: string;
};

export const UnifiedStatus = ({
  dataNoun,
}: UnifiedStatusProps): React.ReactElement => {
  const dataset = useSelector(selectStatusInfo, Lodash.isEqual);

  const vdi = useVdiMetadata();

  const statusContent = React.useMemo(
    () => dataset && vdi
      ? computeDatasetStatus(
        dataset,
        dataNoun,
        vdi.configuration.daemons.reconciler
      )
      : undefined,
    [dataset, vdi, dataNoun]
  );

  return (
    <Attribute label="Status">
      <Icon className="StatusIcon" fa={statusContent?.icon} />
      {statusContent?.content}
    </Attribute>
  )
};

type DatasetState = {
  readonly datasetId?: VDI.DatasetId;
  readonly upload: VDI.DatasetUploadStatusInfo;
  readonly import?: VDI.DatasetImportStatusInfo;
  readonly install?: ReadonlyArray<VDI.DatasetInstallStatusInfo>;
};

const selectStatusInfo = (state: State): Utils.Possible<DatasetState> =>
  Utils.ifDefined(
    state.datasetDetails,
    details => ({
      datasetId: details.datasetId,
      upload: details.status.upload,
      import: details.status.import,
      install: details.status.install
        ?.filter(it => it.installTarget === projectId)
    }),
  );