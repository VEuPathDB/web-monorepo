import {
  find,
  get,
  negate,
  takeWhile,
  tail
} from 'lodash';

/**
 ** this is used below to stop the default menu items list -coming from eupathsitecommon (SiteHeader.jsx)- at favorites (excluding)
 **
 ** @return {boolean}
 **/
function isFavorites(item) {
  return item.id === 'favorites';
}

/**
 ** this is used below to stop the menu items list -coming from eupathsitecommon (SiteHeader.jsx)- at twitter (excluding)
 **
 ** @return {boolean}
 **/
function isTwitter(item) {
  return item.id === 'twitter';
}


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
 ** Get favorites link menu item
 **
 ** @return {Item}
 **/
function findFavoritesItem(defaultItems) {
  return find(defaultItems, isFavorites);
}

/**
 ** Get menu items
 **
 ** @return {Array<Item>}
 **/
export default function mainMenuItems({ siteConfig, preferences }, defaultItems) {
  return getInitialItems(defaultItems).concat([
    { 
      id: 'datasets',
      text: 'Data Sets',
      route: 'search/dataset/AllDatasets/result'
    },
    findFavoritesItem(defaultItems)
  ]);
}

