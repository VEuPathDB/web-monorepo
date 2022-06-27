import { compose, identity, set } from 'lodash/fp';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import {
  wrapStoreModules as addUserDatasetStoreModules
} from '@veupathdb/user-datasets/lib/StoreModules';

import * as accessRequest from './store-modules/AccessRequestStoreModule';
import * as record from './store-modules/RecordStoreModule';

export default compose(
  useUserDatasetsWorkspace
    ? addUserDatasetStoreModules
    : identity,
  set('accessRequest', accessRequest),
  set('record', record)
);
