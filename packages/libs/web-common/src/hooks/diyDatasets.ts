import { useCallback, useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { makeEdaRoute } from '../routes';
import { projectId } from '../config';
import { assertIsVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service/utils/compatibility';
import { DatasetListEntry } from '@veupathdb/user-datasets/lib/Service';

export function useDiyDatasets() {
  const [requestTimestamp, setRequestTimestamp] = useState(() => Date.now());

  const reloadDiyDatasets = useCallback(() => {
    setRequestTimestamp(() => Date.now());
  }, []);

  const diyDatasets = useWdkService(
    async (wdkService) => {
      assertIsVdiCompatibleWdkService(wdkService);
      const user = await wdkService.getCurrentUser();
      if (user.isGuest) return [];
      const userDatasets = await wdkService.vdi.getDatasetList({
        install_target: projectId,
      });
      const unsortedDiyEntries = userDatasets.map(userDatasetToMenuItem);
      return orderBy(unsortedDiyEntries, ({ name }) => name);
    },
    [requestTimestamp]
  );

  const communityDatasets = useWdkService(
    async (wdkService) => {
      assertIsVdiCompatibleWdkService(wdkService);
      const userDatasets = await wdkService.vdi.getCommunityDatasetList();
      const unsortedDiyEntries = userDatasets
        .filter((userDataset) => userDataset.installTargets.includes(projectId))
        .map(userDatasetToMenuItem);
      return orderBy(unsortedDiyEntries, ({ name }) => name);
    },
    [requestTimestamp]
  );

  return useMemo(
    () => ({
      diyDatasets,
      communityDatasets,
      reloadDiyDatasets,
    }),
    [diyDatasets, communityDatasets, reloadDiyDatasets]
  );
}

export interface EnrichedUserDataset extends DatasetListEntry {
  wdkDatasetId: string;
  baseEdaRoute: string;
  userDatasetsRoute: string;
}

function userDatasetToMenuItem(
  userDataset: DatasetListEntry
): EnrichedUserDataset {
  const wdkDatasetId = `EDAUD_${userDataset.datasetId}`;
  return {
    wdkDatasetId,
    baseEdaRoute: `${makeEdaRoute(wdkDatasetId)}`,
    userDatasetsRoute: `/workspace/datasets/${userDataset.datasetId}`,
    ...userDataset,
  };
}
