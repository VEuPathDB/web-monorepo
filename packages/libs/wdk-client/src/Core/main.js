/* global __DEV__ */

// import css files
import 'wdk-client/Core/Style/index.scss';

import { createBrowserHistory } from 'history';
import { identity, isString } from 'lodash';
import { createElement } from 'react';
import * as ReactDOM from 'react-dom';
import * as Components from 'wdk-client/Components';
import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin'; // eslint-disable-line no-unused-vars
import { createMockHistory } from 'wdk-client/Utils/MockHistory';
import { getTransitioner } from 'wdk-client/Utils/PageTransitioner';
import { getInstance as getParamValueStoreInstance } from 'wdk-client/Utils/ParamValueStore';
import { getInstance } from 'wdk-client/Service/WdkService';
import { updateLocation } from 'wdk-client/Actions/RouterActions';
import { loadAllStaticData } from 'wdk-client/Actions/StaticDataActions';
import * as Controllers from 'wdk-client/Controllers';
import Root from 'wdk-client/Core/Root';
import wdkRoutes from 'wdk-client/Core/routes';
import defaultPluginConfig from 'wdk-client/Core/pluginConfig';

import storeModules from 'wdk-client/StoreModules';
import { createWdkStore } from 'wdk-client/Core/Store';

/**
 * Initialize the application.
 *
 * @param {object} options
 * @param {boolean} [options.requireLogin] If true, users will be required to
 *   login to use the website 
 * @param {string} options.rootUrl Root URL used by the router. If the current
 *   page's url does not begin with this option's value, the application will
 *   not render automatically.
 * @param {string|HTMLElement} options.rootElement Where to mount the
 *   application. Can be a selector string or an element. If this option does
 *   not resolve to an element after the DOMContentLoaded event is fired, the
 *   application will not render automatically.
 * @param {string} [options.retainContainerContent] If true, the content in the container
 *   will be retained when rendering the application. Optional, defaults to false.
 * @param {string} options.endpoint Base URL for WdkService.
 * @param {Function} [options.wrapRoutes] A function that takes a WDK Routes array
 *   and returns a modified copy.
 * @param {Function} [options.wrapStoreModules] A function that takes WDK StoreModules
 *   and returns a modified copy.
 * @param {Function} [options.wrapWdkDependencies] A function that takes WdkDependencies
 *   and returns a modified copy.
  * @param {Function} [options.wrapWdkService] A function that takes a WdkService
 *   class and returns a sub class.
 * @param {Function} [options.onLocationChange] Callback function called whenever
 *   the location of the page changes. The function is called with a Location
 *   object.
 * @param {ClientPluginRegistryEntry<unknown>[]} [options.pluginConfig]
 * @param {ReduxMiddleware[]} [options.additionalMiddleware]
 */
export function initialize(options) {
  let {
    requireLogin = false,
    rootUrl,
    rootElement,
    endpoint,
    retainContainerContent = false,
    wrapRoutes = identity,
    wrapStoreModules = identity,
    wrapWdkDependencies = identity,
    wrapWdkService = identity,
    onLocationChange,
    pluginConfig = [],
    additionalMiddleware
  } = options;

  if (!isString(rootUrl)) throw new Error(`Expected rootUrl to be a string, but got ${typeof rootUrl}.`);
  if (!isString(endpoint)) throw new Error(`Expected endpoint to be a string, but got ${typeof endpoint}.`);

  // define the elements of the Flux architecture

  let history = location.pathname.startsWith(rootUrl) && !retainContainerContent
    ? createBrowserHistory({ basename: rootUrl })
    : createMockHistory({ basename: rootUrl });
  let wdkService = wrapWdkService(getInstance(endpoint));
  let paramValueStore = getParamValueStoreInstance(endpoint, wdkService);
  let transitioner = getTransitioner(history);

  let wdkDependencies = wrapWdkDependencies({
    paramValueStore,
    transitioner,
    wdkService
  });

  let store = createWdkStore(
    wrapStoreModules(storeModules),
    wdkDependencies,
    additionalMiddleware
  );

  // load static WDK data into service cache and view stores that need it
  loadAllStaticData(wdkService, store.dispatch);

  // render the root element once page has completely loaded
  document.addEventListener('DOMContentLoaded', function() {
    let container = rootElement instanceof HTMLElement ? rootElement
      : rootElement ? document.querySelector(rootElement)
      : undefined;
    let handleLocationChange = location => {
      if (onLocationChange) onLocationChange(location);
      store.dispatch(updateLocation(location));
    };
    if (container != null) {
      let applicationElement = createElement(
        Root, {
          requireLogin,
          rootUrl,
          store,
          history,
          pluginConfig: pluginConfig.concat(defaultPluginConfig),
          routes: wrapRoutes(wdkRoutes),
          onLocationChange: handleLocationChange,
          wdkDependencies,
          staticContent: retainContainerContent ? container.innerHTML : undefined
        });
      ReactDOM.render(applicationElement, container);
    }
    else if (__DEV__) {
      console.debug('Could not resolve rootElement %o. Application will not render automatically.', rootElement);
    }
  });

  // return WDK application components
  return { wdkService, paramValueStore, store, history, pluginConfig };
}

/**
 * Apply Component wrappers to WDK components and controllers. Keys of
 * 'componentWrappers' should correspond to Component or Controller names in
 * WDK. Values of `componentWrappers` are factories that return a new component.
 *
 * Note that this function applies wrappers "globally", meaning that all apps
 * returned by initialize will use the wrapped components, regardless of when
 * initialize and wrapComponents are called.
 *
 * @param {Object} componentWrappers
 */
export function wrapComponents(componentWrappers) {
  for (let key in componentWrappers) {
    // look in Components for class by this name
    let Component = Components[key];
    // if not found, look in Controllers
    if (Component == null) {
      Component = Controllers[key];
    }
    // if still not found, warn and skip
    if (Component == null) {
      console.warn("Cannot wrap unknown WDK Component '" + key + "'.  Skipping...");
      continue;
    }
    // if found component/controller is not wrappable, log error and skip
    if (!("wrapComponent" in Component)) {
      console.error("Warning: WDK Component `%s` is not wrappable.  WDK version will be used.", key);
      continue;
    }
    // wrap found component/controller
    Component.wrapComponent(componentWrappers[key]);
  }
}
