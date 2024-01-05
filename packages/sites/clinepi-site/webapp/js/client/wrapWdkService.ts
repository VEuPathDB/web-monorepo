import { flowRight, identity, partial } from 'lodash';

import {
  datasetImportUrl,
  endpoint,
  useUserDatasetsWorkspace,
  // vdiServiceUrl,
} from '@veupathdb/web-common/lib/config';

import { wrapWdkService as addUserDatasetServices } from '@veupathdb/user-datasets-legacy/lib/Service';

export default flowRight(
  useUserDatasetsWorkspace
    ? partial(addUserDatasetServices, {
        datasetImportUrl,
        fullWdkServiceUrl: `${window.location.origin}${endpoint}`,
        // vdiServiceUrl,
      })
    : identity
);
