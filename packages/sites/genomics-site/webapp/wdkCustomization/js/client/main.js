import { initialize } from 'ebrc-client/bootstrap';
// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import { wrapRoutes } from './routes';
import wrapStoreModules from './wrapStoreModules';
import pluginConfig from './pluginConfig';

// import CSS files
import 'site/wdkCustomization/css/client.scss';

// Initialize the application.
initialize({
  componentWrappers,
  wrapRoutes,
  wrapStoreModules,
  pluginConfig
})
