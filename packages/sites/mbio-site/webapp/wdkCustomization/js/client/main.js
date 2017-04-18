import 'eupathdb/css/AllSites.css';
import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import mainMenuItems from './mainMenuItems';

// Initialize the application. 
export default (initialize({
  isPartOfEuPathDB: false,
  flattenSearches: true,
  includeQueryGrid: false,
  mainMenuItems
}))

//initialize({
//  mainMenuItems
//});
