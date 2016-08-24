// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents } from 'wdk-client';
import { loadBasketCounts, loadQuickSearches } from './actioncreators/GlobalActionCreators';
import { quickSearches } from './config';

// import apicomm wrappers and additional routes
import { rootUrl, rootElement, endpoint } from './config';
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { wrapRoutes } from './routes';

let apidb = window.apidb = window.apidb || {};

// apply component wrappers (this can be done only once for all initializations)
wrapComponents(componentWrappers);

if (rootUrl) {
  // replace '/a/' with '/${webapp}/'
  let pathname = window.location.pathname;
  let aliasUrl = rootUrl.replace(/^\/[^/]+\/(.*)$/, '/a/$1');
  if (pathname.startsWith(aliasUrl)) {
    window.history.replaceState(null, '', pathname.replace(aliasUrl, rootUrl));
  }
}

// initialize the application
apidb.context = initialize({
  rootUrl,
  rootElement,
  endpoint,
  wrapRoutes,
  storeWrappers
});

console.log('time to init', performance.now() - window.__perf__.start)

let { dispatchAction, stores: { GlobalDataStore } } = apidb.context;

// load quick search data
dispatchAction(loadQuickSearches(quickSearches));

// load basket counts, but only if user is logged in
let basketSub = GlobalDataStore.addListener(() => {
  let globalData = GlobalDataStore.getState();
  if (globalData.user != null) {
    basketSub.remove();

    // load basket counts for menu bar
    if (!globalData.user.isGuest)
      dispatchAction(loadBasketCounts());
  }
})

export default apidb.context;
