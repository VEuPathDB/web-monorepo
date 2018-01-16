import React from 'react';

import './StudyMenu.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import { CategoryIcon } from 'Client/App/Categories';
import { AnchoredTooltip } from 'mesa';

import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

export function linkFromSearchUrl (type = '', url = '') {
  const name = getSearchNameByType(type);
  const icon = getSearchIconByType(type);
  // FIXME: refactor this whole sector and get dynamic study name
  const tooltip = (<span>Search <b>{name}</b> in the PRISM Study</span>);
  return (
    <AnchoredTooltip
      key={type}
      fadeOut={true}
      content={tooltip}
      style={{ pointerEvents: 'none' }}>
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
  return { text };
};

export function menuItemsFromStudies (studies, webAppUrl) {
  return studies
    .map((item, index) => menuItemFromStudy(item, index, webAppUrl));
};
