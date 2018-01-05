import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import studies from './data/studies.json';

initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers,
  studies
});
