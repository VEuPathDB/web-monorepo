import 'site/css/MicrobiomeSite.css';

import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import componentWrappers from './componentWrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';

// Initialize the application.
initialize({
  componentWrappers,
  wrapStoreModules,
  wrapRoutes,
})
