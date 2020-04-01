import { compose, set } from 'lodash/fp';

import * as accessRequest from './store-modules/AccessRequestStoreModule';
import * as record from './store-modules/RecordStoreModule';

export default compose(
  set('accessRequest', accessRequest),
  set('record', record)
);
