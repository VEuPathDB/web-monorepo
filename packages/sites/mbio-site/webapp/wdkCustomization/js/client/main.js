import { initialize } from '@veupathdb/web-common';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './componentWrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';

import 'site/css/MicrobiomeSite.css';

// Initialize the application.
initialize({
  componentWrappers,
  wrapStoreModules,
  wrapRoutes,
})
