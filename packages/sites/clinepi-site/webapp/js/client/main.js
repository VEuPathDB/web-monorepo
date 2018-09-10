import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import GlobalDataStore from './store-wrappers/GlobalDataStore';
import { requestStudies } from './App/Studies/StudyActionCreators';
import wrapStoreModules from './wrapStoreModules';

const ctx = initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  storeWrappers: { GlobalDataStore },
  wrapStoreModules
 // studies
});

ctx.dispatchAction(requestStudies());
