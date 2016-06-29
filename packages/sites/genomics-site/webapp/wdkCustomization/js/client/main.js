// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents } from 'wdk-client';

// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { routes } from './routes';

// apply component wrappers (this can be done only once for all initializations)
wrapComponents(componentWrappers);

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();

// replace '/a/' with '/${webapp}/'
let pathname = window.location.pathname;
let aliasUrl = config.rootUrl.replace(/^\/[^/]+\/(.*)$/, '/a/$1');
if (pathname.startsWith(aliasUrl)) {
  window.history.replaceState(null, '', pathname.replace(aliasUrl, config.rootUrl));
}

// initialize the application
let app = window._app = initialize({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  applicationRoutes: routes,
  storeWrappers
});

// render the root element once page has completely loaded
document.addEventListener('DOMContentLoaded', function() {
  let rootEl = document.querySelector(config.rootElement);
  if (rootEl != null) app.render(rootEl);
});
