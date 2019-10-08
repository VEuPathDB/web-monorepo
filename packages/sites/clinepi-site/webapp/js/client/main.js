import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';
import { reduxMiddleware } from 'ebrc-client/App/DataRestriction/DataRestrictionUtils'

import 'site/css/ClinEpiSite.scss';

initialize({
  componentWrappers,
  wrapStoreModules,
  wrapRoutes,
  additionalMiddleware: [ reduxMiddleware ]
});
