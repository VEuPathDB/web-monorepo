// import CSS files
import 'site/wdkCustomization/css/client.scss';

import { initialize } from 'ebrc-client/bootstrap';
// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import pluginConfig from './pluginConfig';
import { wrapRoutes } from './routes';
import wrapStoreModules from './wrapStoreModules';

// Initialize the application.
initialize({
  componentWrappers,
  wrapRoutes,
  wrapStoreModules,
  pluginConfig,
})
