import { compose, set} from 'lodash/fp';
import studies from 'Client/App/Studies/StudyReducer';
import dataRestriction from 'Client/App/DataRestriction/DataRestrictionReducer';
import { newsReducer } from 'Client/App/NewsSidebar/NewsModule';

import * as accessReqeust from './store-modules/AccessRequestStoreModule';

export default compose(
  set('accessRequest', accessReqeust),
  set('studies', { reduce: studies }),
  set('dataRestriction', { reduce: dataRestriction }),
  set('newsSidebar', { reduce: newsReducer }),
)
