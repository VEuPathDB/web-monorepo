import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import AccessRequestStore from './store-wrappers/AccessRequestStoreWrapper';
import GlobalDataStore from './store-wrappers/GlobalDataStore';
import { requestStudies } from './App/Studies/StudyActionCreators';
import { wrapRoutes } from './routes';
//import studies from './data/studies.json';

const ctx = initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  storeWrappers: { AccessRequestStore, GlobalDataStore },
  wrapRoutes
 // studies
});

ctx.dispatchAction(requestStudies());
