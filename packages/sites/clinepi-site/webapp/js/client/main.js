import 'eupathdb/wdkCustomization/css/client.css';
import 'site/css/ClinEpiSite.css';

import { takeWhile, dropWhile } from 'lodash';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';
import componentWrappers from './component-wrappers';

initialize({
  isPartOfEuPathDB: false,
  mainMenuItems,
  smallMenuItems,
  componentWrappers
});

function mainMenuItems(props, defaultEntries) {
  return takeWhile(defaultEntries, entry => entry.id !== 'profile-or-login');
}

function smallMenuItems(props, defaultEntries) {
  return dropWhile(defaultEntries, entry => entry.id !== 'profile-or-login');
}
