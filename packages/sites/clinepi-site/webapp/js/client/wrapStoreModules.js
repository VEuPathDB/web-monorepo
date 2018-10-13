import { compose, set } from 'lodash/fp';
import studies from 'Client/App/Studies/StudyReducer';
import dataRestriction from 'Client/App/DataRestriction/DataRestrictionReducer';
import { newsReducer } from 'Client/App/NewsSidebar/NewsModule';

import * as accessRequest from './store-modules/AccessRequestStoreModule';

export default compose(
  set('accessRequest', accessRequest),
  set('studies', { reduce: studies }),
  set('dataRestriction', { reduce: dataRestriction }),
  set('newsSidebar', { reduce: newsReducer }),
);
