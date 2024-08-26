import { flowRight, identity, partial } from 'lodash';

import {
  useUserDatasetsWorkspace,
  vdiServiceUrl,
} from '@veupathdb/web-common/lib/config';

import { wrapWdkService as addUserDatasetServices } from '@veupathdb/user-datasets/lib/Service';

export default flowRight(
  useUserDatasetsWorkspace
    ? partial(addUserDatasetServices, {
        vdiServiceUrl,
      })
    : identity
);
