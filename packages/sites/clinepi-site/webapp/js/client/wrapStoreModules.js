import { compose, set } from 'lodash/fp';

import * as accessRequest from './store-modules/AccessRequestStoreModule';

export default compose(
  set('accessRequest', accessRequest),
);
