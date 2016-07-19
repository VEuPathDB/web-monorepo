// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents } from 'wdk-client';

// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { routes as applicationRoutes } from './routes';

// apply component wrappers (this can be done only once for all initializations)
wrapComponents(componentWrappers);

// getApiClientConfig() is defined in /client/index.jsp
let { rootUrl, rootElement, endpoint } = window.getApiClientConfig();

// replace '/a/' with '/${webapp}/'
let pathname = window.location.pathname;
let aliasUrl = rootUrl.replace(/^\/[^/]+\/(.*)$/, '/a/$1');
if (pathname.startsWith(aliasUrl)) {
  window.history.replaceState(null, '', pathname.replace(aliasUrl, rootUrl));
}

// initialize the application
window._app = initialize({
  rootUrl,
  rootElement,
  endpoint,
  applicationRoutes,
  storeWrappers
});
