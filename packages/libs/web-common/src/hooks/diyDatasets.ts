import { useCallback, useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { makeEdaRoute } from '../routes';
import {
  isDiyWdkRecordId,
  wdkRecordIdToDiyUserDatasetId,
} from '@veupathdb/wdk-client/lib/Utils/diyDatasets';
import { assertIsVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { projectId } from '../config';
import {
  UserDataset,
  UserDatasetVDI,
} from '@veupathdb/user-datasets/lib/Utils/types';

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
      const userDatasets = await wdkService.getCurrentUserDatasets(projectId);
      const unsortedDiyEntries = userDatasets.map(userDatasetToMenuItem);
      return orderBy(unsortedDiyEntries, ({ name }) => name);
    },
    [requestTimestamp]
  );

  const communityDatasets = useWdkService(
    async (wdkService) => {
      assertIsVdiCompatibleWdkService(wdkService);
      const userDatasets = await wdkService.getCommunityDatasets();
      const unsortedDiyEntries = userDatasets
        .filter((userDataset) => userDataset.projectIds.includes(projectId))
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

export interface EnrichedUserDataset extends UserDatasetVDI {
  wdkDatasetId: string;
  baseEdaRoute: string;
  userDatasetsRoute: string;
}

function userDatasetToMenuItem(
  userDataset: UserDatasetVDI
): EnrichedUserDataset {
  const wdkDatasetId = `EDAUD_${userDataset.datasetId}`;
  return {
    wdkDatasetId,
    baseEdaRoute: `${makeEdaRoute(wdkDatasetId)}`,
    userDatasetsRoute: `/workspace/datasets/${userDataset.datasetId}`,
    ...userDataset,
  };
}
