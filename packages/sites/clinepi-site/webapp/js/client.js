import { takeWhile, dropWhile } from 'lodash';
import 'eupathdb/wdkCustomization/css/client.css';
import { initialize } from 'eupathdb/wdkCustomization/js/client/bootstrap';

initialize({
  isPartOfEuPathDB: false,
  additionalMenuEntries,
  smallMenuEntries
});


function additionalMenuEntries(props, defaultEntries) {
  return takeWhile(defaultEntries, entry => entry.id !== 'profile-or-login');
}

function smallMenuEntries(props, defaultEntries) {
  return dropWhile(defaultEntries, entry => entry.id !== 'profile-or-login');
}
