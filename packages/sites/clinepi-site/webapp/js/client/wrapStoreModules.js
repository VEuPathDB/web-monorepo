import { compose, set} from 'lodash/fp';
import studies from 'Client/App/Studies/StudyReducer';
import dataRestriction from 'Client/App/DataRestriction/DataRestrictionReducer';

export default compose(
  set('studies', { reduce: studies }),
  set('dataRestriction', { reduce: dataRestriction })
)