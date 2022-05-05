import { flowRight, identity, partial } from 'lodash';

import { datasetImportUrl, endpoint, useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import { wrapWdkService as addUserDatasetServices } from '@veupathdb/user-datasets/lib/Service';

export default flowRight(
  useUserDatasetsWorkspace
    ? partial(
        addUserDatasetServices,
        {
          datasetImportUrl,
          fullWdkServiceUrl: `${window.location.origin}${endpoint}`
        }
      )
    : identity
);
