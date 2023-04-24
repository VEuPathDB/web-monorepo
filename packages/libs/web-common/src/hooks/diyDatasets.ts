import { useCallback, useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { makeEdaRoute } from '../routes';
import {
  isDiyWdkRecordId,
  wdkRecordIdToDiyUserDatasetId,
} from '@veupathdb/wdk-client/lib/Utils/diyDatasets';

export function useDiyDatasets() {
  const [requestTimestamp, setRequestTimestamp] = useState(() => Date.now());

  const reloadDiyDatasets = useCallback(() => {
    setRequestTimestamp(() => Date.now());
  }, []);

  const diyDatasets = useWdkService(
    async (wdkService) => {
      const { records: datasetRecords } = await wdkService.getAnswerJson(
        {
          searchName: 'AllDatasets',
          searchConfig: {
            parameters: {},
          },
        },
        {
          attributes: [],
        }
      );

      const unsortedDiyEntries = datasetRecords.flatMap((record) => {
        const wdkDatasetId = record.id
          .filter((part) => part.name === 'dataset_id')
          .map((part) => part.value)[0];

        if (wdkDatasetId == null || !isDiyWdkRecordId(wdkDatasetId)) {
          return [];
        }

        const userDatasetId = wdkRecordIdToDiyUserDatasetId(wdkDatasetId);

        return [
          {
            name: record.displayName,
            wdkDatasetId,
            userDatasetId,
            baseEdaRoute: `${makeEdaRoute(wdkDatasetId)}`,
            userDatasetsRoute: `/workspace/datasets/${userDatasetId}`,
          },
        ];
      });

      return orderBy(unsortedDiyEntries, ({ name }) => name);
    },
    [requestTimestamp]
  );

  return useMemo(
    () => ({
      diyDatasets,
      reloadDiyDatasets,
    }),
    [diyDatasets, reloadDiyDatasets]
  );
}
