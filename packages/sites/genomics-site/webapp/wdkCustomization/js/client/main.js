// Bootstrap the WDK client application
// ====================================

import Wdk from 'wdk';

// Import Component wrappers
import * as wrappers from './componentWrappers';

// apply wrappers
for (let key in wrappers) {
  let Component = Wdk.client.Components[key];
  if (Component == null) {
    console.warn("Cannot wrap unknown WDK Component", key);
    continue;
  }
  Wdk.client.Components[key].wrapComponent(wrappers[key]);
}

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = Wdk.client.run({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement
});

// TODO Convert initialData to an action
// if (config.initialData) {
//   let action = config.initialData;
//   app.store.dispatch(action);
// }
