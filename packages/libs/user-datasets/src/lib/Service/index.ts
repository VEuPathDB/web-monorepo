import { mapValues } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { userDatasetsServiceWrappers } from './UserDatasetWrappers';
import {
  ServiceConfig as UserDatasetUploadServiceConfig,
  makeUserDatasetUploadServiceWrappers,
} from './UserDatasetUploadWrappers';

export function wrapWdkService(
  serviceConfig: UserDatasetUploadServiceConfig | undefined,
  wdkService: WdkService
) {
  const wrappersToInclude =
    serviceConfig == null
      ? userDatasetsServiceWrappers
      : {
          ...userDatasetsServiceWrappers,
          ...makeUserDatasetUploadServiceWrappers(serviceConfig),
        };

  return {
    ...wdkService,
    ...mapValues(wrappersToInclude, (wdkServiceWrapper) =>
      wdkServiceWrapper(wdkService)
    ),
  };
}
