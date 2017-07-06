import 'site/css/ClinEpiSite.css';

import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import componentWrappers from './component-wrappers';

initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  mainMenuItems,
  smallMenuItems,
  componentWrappers
});

function mainMenuItems(props, defaultItems) {
  return [
    defaultItems.home,
    defaultItems.search,
    defaultItems.strategies,
    {
      id: 'studies',
      text: 'Studies',
      route: 'record/dataset/DS_c75ea37cb3'
    },
    {
      id: 'help',
      text: 'Help',
      url: '#'
    }
  ]
}

function smallMenuItems(props, defaultItems) {
  return [
    defaultItems.profileOrLogin,
    defaultItems.registerOrLogout,
    defaultItems.contactUs
  ]
}
