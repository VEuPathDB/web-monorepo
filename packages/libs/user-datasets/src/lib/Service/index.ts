import { mapValues } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { userDatasetsServiceWrappers } from './UserDatasetWrappers';
import { makeUserDatasetUploadServiceWrappers } from './UserDatasetUploadWrappers';

export function wrapWdkService(
  datasetImportUrl: string | undefined,
  wdkService: WdkService
) {
  const wrappersToInclude =
    datasetImportUrl == null
      ? userDatasetsServiceWrappers
      : {
          ...userDatasetsServiceWrappers,
          ...makeUserDatasetUploadServiceWrappers(datasetImportUrl),
        };

  return {
    ...wdkService,
    ...mapValues(wrappersToInclude, (wdkServiceWrapper) =>
      wdkServiceWrapper(wdkService)
    ),
  };
}
