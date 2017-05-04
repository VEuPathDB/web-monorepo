import 'site/css/ClinEpiSite.css';

import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import componentWrappers from './component-wrappers';

initialize({
  isPartOfEuPathDB: false,
  mainMenuItems,
  smallMenuItems,
  componentWrappers
});

function mainMenuItems(props, defaultItems) {
  return [
    defaultItems.search,
    defaultItems.strategies,
    defaultItems.basket,
    defaultItems.favorites
  ]
}

function smallMenuItems(props, defaultItems) {
  return [
    defaultItems.profileOrLogin,
    defaultItems.registerOrLogout,
    defaultItems.contactUs
  ]
}
