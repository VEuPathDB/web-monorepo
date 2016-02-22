// Bootstrap the WDK client application
// ====================================

import { run, wrapComponents, wrapStores } from 'wdk-client';

// Import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { routes } from './routes';

console.log(require.context('./components/records', true, /^\.\/.*\.jsx?$/));

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
