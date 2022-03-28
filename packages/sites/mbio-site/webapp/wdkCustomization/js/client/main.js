import { initialize } from '@veupathdb/web-common';
import { partial } from 'lodash';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';
import 'site/css/MicrobiomeSite.css';

// Initialize the application.
initialize({
  componentWrappers,
  wrapWdkDependencies: partial(wrapWdkDependencies, edaServiceUrl),
  wrapStoreModules,
  wrapRoutes,
})
