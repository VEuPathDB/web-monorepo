import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
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
