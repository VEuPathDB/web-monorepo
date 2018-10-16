import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import { requestStudies } from 'Client/App/Studies/StudyActionCreators';
import wrapStoreModules from './wrapStoreModules';
import { requestNews } from 'Client/App/NewsSidebar/NewsModule';
import { wrapRoutes } from './routes';

const ctx = initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  wrapStoreModules,
  wrapRoutes
});

ctx.store.dispatch(requestStudies());
ctx.store.dispatch(requestNews());
