// import CSS files
import 'eupathdb/css/AllSites.css';
import 'site/css/AllApiSites.css';
import 'site/wdkCustomization/css/client.css';

import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import mainMenuItems from './mainMenuItems';
import smallMenuItems from './smallMenuItems';

// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { wrapRoutes } from './routes';

const quickSearches = [
  { name: 'GeneBySingleLocusTag', quickSearchParamName: 'single_gene_id', quickSearchDisplayName: 'Gene ID' },
  { name: 'GenesByTextSearch', quickSearchParamName: 'text_expression', quickSearchDisplayName: 'Gene Text Search'}
];

// Initialize the application. Store a reference to the returned application
// context on `window.apidb.context`. This is used by gbrowse.
export default ((window.apidb = window.apidb || {}).context = initialize({
  componentWrappers,
  quickSearches,
  storeWrappers,
  wrapRoutes,
  mainMenuItems,
  smallMenuItems
}))
