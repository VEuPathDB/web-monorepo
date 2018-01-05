import React from 'react';

import './StudyMenu.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import { CategoryIcon } from 'Client/App/Categories';

import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

export function ucFirst (text) {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
};

export function linkFromSearchUrl (type = '', url = '') {
  const name = getSearchNameByType(type);
  const icon = getSearchIconByType(type);
  return (
    <a name={`Search for ${name}`} href={url} key={type}>
      <Icon fa={icon} />
    </a>
  );
};

export function linksFromSearchUrls (searchUrls = {}, webappUrl = '') {
  return (
    <div>
      {Object.entries(searchUrls).map(([ type, url ]) => linkFromSearchUrl(type, webappUrl + url))}
    </div>
  );
};

export function menuItemFromStudy (study = {}, index, webappUrl) {
  const { name, url, searchUrls } = study;
  const text = (
    <row key={index} className="StudyMenuItem">
      <box className="grow-1">
        {name}
      </box>
      <row className="grow-0 StudyMenuItem-Links">
        {linksFromSearchUrls(searchUrls, webappUrl)}
      </row>
    </row>
  );
  return { text, url };
}

export function menuItemsFromStudies (studies, webappUrl) {
  return studies
    .filter(({ disabled }) => !disabled)
    .map((item, index) => menuItemFromStudy(item, index, webappUrl));
}

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
