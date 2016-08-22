// Bootstrap the WDK client application
// ====================================

// TODO Remove auth_tkt from url before proceeding

import { initialize, wrapComponents } from 'wdk-client';

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

// load basket counts for menu bar
apidb.context.dispatchAction(function(dispatch, { wdkService }) {
  wdkService.getCurrentUser().then(user => {
    if (!user.isGuest) {
      return wdkService.getBasketCounts().then(basketCounts => {
        dispatch({
          type: 'apidb/basket',
          payload: { basketCounts }
        });
      });
    }
  })
  .catch(serviceError => {
    if (serviceError.status !== 403) {
      console.error('Unexpected error while attempting to retrieve basket counts.', serviceError);
    }
  });
});

export default apidb.context;
