import { mapValues } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import {
  ServiceConfig as UserDatasetUploadServiceConfig,
  makeUserDatasetUploadServiceWrappers,
} from './UserDatasetUploadWrappers';

import { UserDatasetApi, VDI_SERVICE_BASE_URL } from './api';

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
      ? undefined
      : {
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
