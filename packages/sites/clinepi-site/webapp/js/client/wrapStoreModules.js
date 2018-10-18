import { compose, set } from 'lodash/fp';
import studies from 'Client/App/Studies/StudyReducer';
import dataRestriction from 'Client/App/DataRestriction/DataRestrictionReducer';
import { newsReducer } from 'Client/App/NewsSidebar/NewsModule';

import * as accessRequest from './store-modules/AccessRequestStoreModule';

export default compose(
  set('accessRequest', accessRequest),
  set('studies', { key: 'studies', reduce: studies }),
  set('dataRestriction', { key: 'dataRestriction', reduce: dataRestriction }),
  set('newsSidebar', { key: 'newsSidebar', reduce: newsReducer }),
);
