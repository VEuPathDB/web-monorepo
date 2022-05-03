import { compose, set } from 'lodash/fp';

import {
  wrapStoreModules as addUserDatasetStoreModules
} from '@veupathdb/user-datasets/lib/StoreModules';

import * as accessRequest from './store-modules/AccessRequestStoreModule';
import * as record from './store-modules/RecordStoreModule';

export default compose(
  addUserDatasetStoreModules,
  set('accessRequest', accessRequest),
  set('record', record)
);
