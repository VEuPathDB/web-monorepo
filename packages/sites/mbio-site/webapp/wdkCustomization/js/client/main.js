import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import mainMenuItems from './mainMenuItems';
import wrapStoreModules from './wrapStoreModules';

// Initialize the application.
initialize({
  isPartOfEuPathDB: false,
  includeQueryGrid: false,
  mainMenuItems,
  wrapStoreModules
})
