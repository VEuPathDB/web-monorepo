import { mapValues } from 'lodash';
import { userDatasetsServiceWrappers } from './UserDatasetWrappers';
import { makeUserDatasetUploadServiceWrappers } from './UserDatasetUploadWrappers';
export function wrapWdkService(serviceConfig, wdkService) {
  const wrappersToInclude =
    serviceConfig == null
      ? userDatasetsServiceWrappers
      : Object.assign(
          Object.assign({}, userDatasetsServiceWrappers),
          makeUserDatasetUploadServiceWrappers(serviceConfig)
        );
  return Object.assign(
    Object.assign({}, wdkService),
    mapValues(wrappersToInclude, (wdkServiceWrapper) =>
      wdkServiceWrapper(wdkService)
    )
  );
}
//# sourceMappingURL=index.js.map
