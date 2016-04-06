// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents, wrapStores } from 'wdk-client';

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

// replace '/a/' with '/${webapp}/'
let pathname = window.location.pathname;
let aliasUrl = config.rootUrl.replace(/^\/[^/]+\/(.*)$/, '/a/$1');
if (pathname.indexOf(aliasUrl) === 0) {
  window.history.replaceState(null, '', pathname.replace(aliasUrl, config.rootUrl));
}

let app = window._app = initialize({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement,
  applicationRoutes: routes
});

app.render();
