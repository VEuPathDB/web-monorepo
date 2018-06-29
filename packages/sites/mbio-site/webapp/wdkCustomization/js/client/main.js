import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import mainMenuItems from './mainMenuItems';
import * as storeWrappers from './store-wrappers';

// Initialize the application.
initialize({
  isPartOfEuPathDB: false,
  includeQueryGrid: false,
  mainMenuItems,
  storeWrappers
})
