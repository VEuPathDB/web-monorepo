import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';

initialize({
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  mainMenuItems: (props, defaultItems) => [
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
  ],
  smallMenuItems: (props, defaultItems) => [
    defaultItems.profileOrLogin,
    defaultItems.registerOrLogout,
    defaultItems.contactUs
  ],
  componentWrappers
});
