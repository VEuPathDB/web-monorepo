// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { run, wrapComponents, wrapStores } from 'wdk-client';

// Import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { routes } from './routes';

// apply component wrappers
wrapComponents(componentWrappers);

// apply store wrappers
wrapStores(storeWrappers);

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement,
  applicationRoutes: routes
});
