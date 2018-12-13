import 'site/css/ClinEpiSite.scss';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import { wrapRoutes } from './routes';

initialize({
  componentWrappers,
  wrapStoreModules,
  wrapRoutes
});
