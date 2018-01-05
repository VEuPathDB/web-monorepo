import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';

initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  componentWrappers
});
