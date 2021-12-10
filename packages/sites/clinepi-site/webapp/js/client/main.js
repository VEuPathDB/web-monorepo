import { partial } from 'lodash';

import { reduxMiddleware } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';

import 'site/css/ClinEpiSite.scss';

initialize({
  componentWrappers,
  wrapWdkDependencies: partial(wrapWdkDependencies, edaServiceUrl),
  wrapStoreModules,
  wrapRoutes,
  additionalMiddleware: [ reduxMiddleware ]
});
