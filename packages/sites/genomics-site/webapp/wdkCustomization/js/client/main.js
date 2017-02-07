// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents } from 'wdk-client';
import { debounce } from 'lodash';
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

// remove jsessionid from url
window.history.replaceState(null, '',
  window.location.pathname.replace(/;jsessionid=\w{32}/i, '') +
  window.location.search + window.location.hash);

// initialize the application
apidb.context = initialize({
  rootUrl,
  rootElement,
  endpoint,
  wrapRoutes,
  storeWrappers,
  onLocationChange: debounce(onLocationChange, 1000)
});

let { dispatchAction } = apidb.context;

// load quick search data
// TODO Move to controller override
dispatchAction(loadQuickSearches(quickSearches));
dispatchAction(loadBasketCounts());

export default apidb.context;


// save previousLocation so we can conditionally send pageview events
let previousLocation;

/** Send pageview events to Google Analytics */
function onLocationChange(location) {
  // skip if google analytics object is not defined
  if (!window.ga) return;

  // skip if the previous pathname and new pathname are the same, since
  // hash changes are currently detected.
  if (previousLocation && previousLocation.pathname === location.pathname) return;

  // update previousLocation
  previousLocation = location;

  window.ga('send', 'pageview', {
    page: location.pathname,
    title: location.pathname
  });
}
