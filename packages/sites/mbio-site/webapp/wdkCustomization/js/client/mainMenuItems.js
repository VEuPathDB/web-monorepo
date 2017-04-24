import {
  find,
  get,
  negate,
  takeWhile,
  tail
} from 'lodash';

/**
 ** Get subset of defaultItems we want to show in menu.
 **
 ** @return {Array<Item>}
 **/
function getInitialItems(defaultItems) {
//  return takeWhile(defaultItems, negate(isFavorites));
//  return takeWhile(defaultItems, negate(isTwitter));
  return tail(takeWhile(defaultItems, negate(isTwitter)));
}

/**
 ** Get menu items
 **
 ** @return {Array<Item>}
 **/
export default function mainMenuItems({ siteConfig, preferences }, defaultItems) {
  return [ 
    defaultItems.search,
    defaultItems.strategies,
    defaultItems.basket,
    defaultItems.favorites,
    { 
      id: 'datasets',
      text: 'Data Sets',
      route: 'search/dataset/AllDatasets/result'
    },
   defaultItems.profileOrLogin,
   defaultItems.registerOrLogout,
   defaultItems.contactUs
  ];
}

