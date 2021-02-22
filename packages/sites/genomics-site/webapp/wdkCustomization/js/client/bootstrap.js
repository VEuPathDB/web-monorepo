import { initialize as initializeEbrc } from '@veupathdb/web-common/lib/bootstrap';
// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import { wrapRoutes } from './routes';
import wrapStoreModules from './wrapStoreModules';
import pluginConfig from './pluginConfig';

// import CSS files
import '@veupathdb/web-common/lib/styles/client.scss';
import 'site/css/AllApiSites.css';
import 'site/wdkCustomization/css/client.scss';

// Initialize the application.
export const initialize =  initializeWdk => initializeEbrc({
  initializeWdk,
  componentWrappers,
  wrapRoutes,
  wrapStoreModules,
  pluginConfig
})
