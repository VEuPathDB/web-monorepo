import { flowRight, partial } from 'lodash';

import { endpoint } from '@veupathdb/web-common/lib/config';

import { wrapWdkService as addUserDatasetServices } from '@veupathdb/user-datasets/lib/Service';

export default flowRight(
  partial(
    addUserDatasetServices,
    {
      datasetImportUrl: '/dataset-import',
      fullWdkServiceUrl: `${window.location.origin}${endpoint}`
    }
  )
);
