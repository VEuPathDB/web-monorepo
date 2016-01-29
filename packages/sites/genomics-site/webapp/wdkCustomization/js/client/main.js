// Bootstrap the WDK client application
// ====================================

import { run, Components } from 'wdk-client';

// Import Component wrappers
import * as wrappers from './componentWrappers';

// apply wrappers
for (let key in wrappers) {
  let Component = Components[key];
  if (Component == null) {
    console.warn("Cannot wrap unknown WDK Component", key);
    continue;
  }
  Components[key].wrapComponent(wrappers[key]);
}

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement
});

// TODO Convert initialData to an action
// if (config.initialData) {
//   let action = config.initialData;
//   app.store.dispatch(action);
// }
