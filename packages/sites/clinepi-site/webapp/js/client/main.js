import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import studies from './studies';

initialize({
  studies,
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  mainMenuItems: (props, defaultItems) => [
    defaultItems.home,
    defaultItems.search,
    defaultItems.strategies,
    {
      id: 'studies',
      text: 'Studies',
      route: studies.find(s => s.active).route
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
