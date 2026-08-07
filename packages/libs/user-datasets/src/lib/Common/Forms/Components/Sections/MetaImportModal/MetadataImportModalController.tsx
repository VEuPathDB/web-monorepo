import React, { ReactElement, useEffect, useState } from 'react';
import { DataNoun, Runnable } from '../../../../../Utils';
import {
  DatasetListEntry,
  VdiServiceConfig,
  useVdiService,
} from '../../../../../Service';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { MetadataImportModal } from './MetadataImportModal';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { projectIdToDisplayName } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';
import { projectId } from '../../../../../config';

export interface MetadataImportModalControllerProps {
  readonly baseUrl: string;
  readonly vdiConfig: VdiServiceConfig;
  readonly dataNoun: DataNoun;
  readonly arePublicDatasetsEnabled: boolean;
  readonly isModalShowing: boolean;
  readonly hideModal: Runnable;
}

export function MetadataImportModalController(
  props: MetadataImportModalControllerProps
): ReactElement {
  const vdi = useVdiService();

  const [datasets, setDatasets] = useState<DatasetListEntry[]>();

  const userId = useWdkService((wdk) => wdk.getCurrentUser())?.id;

  const siteDisplayName = projectIdToDisplayName(projectId)!;

  useEffect(
    () => {
      if (!vdi) return;

      (async function () {
        const datasets = await vdi.getDatasetList();
        datasets.push(...(await vdi.getCommunityDatasetList()));
        setDatasets(datasets);
      })();
    },
    // eslint-disable-next-line -- don't care if it is the same 'vdi' object
    [vdi != null]
  );

  if (datasets === undefined || userId === undefined) return <Loading />;

  return (
    <MetadataImportModal
      modalProps={{ visible: props.isModalShowing, hide: props.hideModal }}
      tableProps={{ ...props, datasets, userId, siteDisplayName }}
    />
  );
}
