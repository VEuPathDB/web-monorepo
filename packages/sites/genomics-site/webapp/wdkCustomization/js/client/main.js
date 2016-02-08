// Bootstrap the WDK client application
// ====================================

import { run, Components } from 'wdk-client';

// Import Component wrappers
import * as wrappers from './componentWrappers';
import { routes } from './routes';

// apply wrappers
for (let key in wrappers) {
  let Component = Components[key];
  if (Component == null) {
    console.warn("Cannot wrap unknown WDK Component '" + key + "'.  Skipping...");
    continue;
  }
  if (!("wrapComponent" in Components[key])) {
    console.warn("WDK Component '" + key + "' is not wrappable.  WDK version will be used.");
    continue;
  }
  Components[key].wrapComponent(wrappers[key]);
}

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement,
  applicationRoutes: routes
});

// TODO Convert initialData to an action
// if (config.initialData) {
//   let action = config.initialData;
//   app.store.dispatch(action);
// }
