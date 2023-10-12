import { mapValues } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { userDatasetsServiceWrappers } from './UserDatasetWrappers';
import {
  ServiceConfig as UserDatasetUploadServiceConfig,
  makeUserDatasetUploadServiceWrappers,
} from './UserDatasetUploadWrappers';

import { UserDatasetApi } from './api';

const VDI_SERVICE_BASE_URL = 'http://localhost:8080';

export function wrapWdkService(
  serviceConfig: UserDatasetUploadServiceConfig | undefined,
  wdkService: WdkService
) {
  const vdiService = new UserDatasetApi(
    { baseUrl: VDI_SERVICE_BASE_URL },
    wdkService
  );

  const wrappersToInclude =
    serviceConfig == null
      ? userDatasetsServiceWrappers
      : {
          ...userDatasetsServiceWrappers,
          ...makeUserDatasetUploadServiceWrappers(serviceConfig),
        };

  return {
    ...wdkService,
    ...vdiService,
    ...mapValues(wrappersToInclude, (wdkServiceWrapper) =>
      wdkServiceWrapper(wdkService)
    ),
  };
}
