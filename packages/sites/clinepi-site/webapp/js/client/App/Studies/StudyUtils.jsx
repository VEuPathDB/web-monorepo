import React from 'react';

import './StudyMenu.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import { CategoryIcon } from 'Client/App/Categories';
import { AnchoredTooltip } from 'mesa';

import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

export function ucFirst (text) {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
};

export function linkFromSearchUrl (type = '', url = '') {
  const name = getSearchNameByType(type);
  const icon = getSearchIconByType(type);
  // FIXME: refactor this whole sector and get dynamic study name
  const tooltip = (<span>Search <b>{name}</b> in the PRISM Study</span>);
  return (
    <AnchoredTooltip
      key={type}
      fadeOut={true}
      offset={{ top: 28, left: 25 }}
      style={{ pointerEvents: 'none' }}
      content={tooltip}>
      <a name={`Search ${name}`} href={url} key={type}>
        <Icon fa={icon} />
      </a>
    </AnchoredTooltip>
  );
};

export function linksFromSearchUrls (searchUrls = {}, webappUrl = '') {
  return (
    <div>
      {Object.entries(searchUrls).map(([ type, url ]) => linkFromSearchUrl(type, webappUrl + url))}
    </div>
  );
};

export function menuItemFromStudy (study = {}, index, webAppUrl) {
  const { name, url, appUrl, searchUrls, disabled } = study;
  const href = appUrl
    ? (webAppUrl ? webAppUrl : '') + (appUrl.indexOf('/') === 0 ? '' : '/') + appUrl
    : url;
  const text = (
    <row key={index} className={'StudyMenuItem' + (disabled ? ' StudyMenuItem--disabled' : '')}>
      <box className="grow-1">
        <a href={href}>
          {name}
        </a>
      </box>
      <row className="grow-0 StudyMenuItem-Links">
        {linksFromSearchUrls(searchUrls, webAppUrl)}
      </row>
    </row>
  );
  return { text };//disabled ? { text } : { text, url, appUrl };
}

export function menuItemsFromStudies (studies, webAppUrl) {
  return studies
    .map((item, index) => menuItemFromStudy(item, index, webAppUrl));
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

export function injectStudyWebappUrl (study, webAppUrl) {
  const { searchUrls } = study;
  if (!searchUrls || typeof searchUrls !== 'object' || !Object.keys(searchUrls).length) return study;
  const newSearchUrls = {};
  for (let key in searchUrls) { newSearchUrls[key] = (webAppUrl ? webAppUrl : '') + searchUrls[key]; };
  return Object.assign({}, study, { searchUrls: newSearchUrls });
}

export function addWebAppUrlToStudies (list, webAppUrl) {
  if (!list || !Array.isArray(list)) return list;
  return list.map(study => injectStudyWebappUrl(study, webAppUrl));
}

export function iconMenuItemsFromSocials (siteConfig = {}) {
  const { facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const items = [];
  if (facebookUrl) items.push({ type: 'facebook', url: facebookUrl });
  if (twitterUrl) items.push({ type: 'twitter', url: twitterUrl });
  if (youtubeUrl) items.push({ type: 'youtube', url: youtubeUrl });
  return items;
}
