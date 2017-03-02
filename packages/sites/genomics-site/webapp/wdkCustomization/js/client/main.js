import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import additionalMenuEntries from './menuItems';
import smallMenuEntries from './smallMenuItems';

// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import * as storeWrappers from './storeWrappers';
import { wrapRoutes } from './routes';

const quickSearches = [
  { name: 'GeneBySingleLocusTag', quickSearchParamName: 'single_gene_id', quickSearchDisplayName: 'Gene ID' },
  { name: 'GenesByTextSearch', quickSearchParamName: 'text_expression', quickSearchDisplayName: 'Gene Text Search'}
];

export default ((window.apidb = window.apidb || {}).context = initialize({
  componentWrappers,
  quickSearches,
  storeWrappers,
  wrapRoutes,
  additionalMenuEntries,
  smallMenuEntries
}))
