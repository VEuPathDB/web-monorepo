import React from 'react';
import { CategoryIcon } from 'Client/App/Categories';

export function ucFirst (text) {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
};

export function injectWebappUrl (map, webappUrl = '') {
  const replace = (item) => {
    return typeof item == 'string'
      ? item.replace('%webapp%', webappUrl)
      : item;
  }
  if (typeof map === 'string')
    return replace(map);
  if (typeof map !== 'object')
    return map;
  if (Array.isArray(map))
    return map.map(item => injectWebappUrl(item, webappUrl));
  return Object.entries(map)
    .reduce((output, [ key, value ]) => {
      return Object.assign({}, output, { [key]: injectWebappUrl(value, webappUrl) });
    }, {});
}

export function createStudyCategoryPredicate (targetCategory) {
  return ({ categories } = {}) => {
    return !categories ? false : categories
      .map(category => category.toLowerCase())
      .includes(targetCategory.toLowerCase());
  };
};

export function createStudyCategoryFilter (id) {
  const display = (<label><CategoryIcon category={id} /> {ucFirst(id)}</label>);
  const predicate = createStudyCategoryPredicate(id);
  return { id, display, predicate };
};

export function getStudyListCategories (studies) {
  return studies
    .map(({ categories }) => categories)
    .filter(categories => categories && categories.length)
    .reduce((result, set) => {
      const additions = set.filter(cat => !result.includes(cat));
      return [ ...result, ...additions];
    }, []);
};

export function getStudyCategoryFilters (studies) {
  const categories = getStudyListCategories(studies);
  return categories.map(createStudyCategoryFilter);
};
