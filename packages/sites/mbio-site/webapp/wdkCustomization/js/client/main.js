import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import componentWrappers from './componentWrappers';
import wrapStoreModules from './wrapStoreModules';

// Initialize the application.
initialize({
  componentWrappers,
  wrapStoreModules,
})
