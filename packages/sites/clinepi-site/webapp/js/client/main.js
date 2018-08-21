import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import GlobalDataStore from './store-wrappers/GlobalDataStore';
import { requestStudies } from './App/Studies/StudyActionCreators';
//import studies from './data/studies.json';

const ctx = initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  storeWrappers: { GlobalDataStore }
 // studies
});

ctx.dispatchAction(requestStudies());
