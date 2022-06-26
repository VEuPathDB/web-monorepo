import { useCallback, useMemo, useState } from 'react';

import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { makeEdaRoute } from '../routes';
import { isDiyWdkRecordId, wdkRecordIdToDiyUserDatasetId } from '../util/diyDatasets';

export function useDiyDatasets() {
  const [requestTimestamp, setRequestTimestamp] = useState(() => Date.now());

  const reloadDiyDatasets = useCallback(() => {
    setRequestTimestamp(() => Date.now());
  }, []);

  const diyDatasets = useWdkServiceWithRefresh(async (wdkService) => {
    const { records: datasetRecords } = await wdkService.getAnswerJson(
      {
        searchName: 'AllDatasets',
        searchConfig: {
          parameters: {}
        }
      },
      {
        attributes: []
      }
    );

    return (
      datasetRecords.flatMap(
        record => {
          const wdkDatasetId = record.id
            .filter(part => part.name === 'dataset_id')
            .map(part => part.value)[0];

          if (
            wdkDatasetId == null ||
            !isDiyWdkRecordId(wdkDatasetId)
          ) {
            return [];
          }

          const userDatasetId = wdkRecordIdToDiyUserDatasetId(wdkDatasetId);

          return [
            {
              name: record.displayName,
              wdkDatasetId,
              userDatasetId,
              baseEdaRoute: `${makeEdaRoute(wdkDatasetId)}`,
              userDatasetsRoute: `/workspace/datasets/${userDatasetId}`
            }
          ];
        }
      )
    );
  }, [requestTimestamp]);

  return useMemo(() => ({
    diyDatasets,
    reloadDiyDatasets
  }), [diyDatasets, reloadDiyDatasets]);
}
