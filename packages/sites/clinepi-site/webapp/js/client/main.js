import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import { requestStudies } from './App/Studies/StudyActionCreators';
import wrapStoreModules from './wrapStoreModules';

const ctx = initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  wrapStoreModules
});

ctx.store.dispatch(requestStudies());
