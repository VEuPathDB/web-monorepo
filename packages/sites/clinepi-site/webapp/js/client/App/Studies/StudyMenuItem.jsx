import React from 'react';

import './StudyMenu.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import { CategoryIcon } from 'Client/App/Categories';
import { AnchoredTooltip } from 'mesa';
import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

class StudyMenuItem extends React.Component {
  constructor (props) {
    super(props);
    this.getStudyUrl = this.getStudyUrl.bind(this);
    this.makeAppUrl = this.makeAppUrl.bind(this);
    this.getStudySearches = this.getStudySearches.bind(this);
    this.renderSearchLink = this.renderSearchLink.bind(this);
  }

  getStudyUrl () {
    const { study, config } = this.props;
    const { webAppUrl } = config;
    const { appUrl, url } = study;
    return !appUrl ? url : this.makeAppUrl(appUrl);
  }

  makeAppUrl (url) {
    const { config } = this.props;
    const { webAppUrl } = config;
    return (webAppUrl ? webAppUrl : '') + (!url.indexOf('/') ? '' : '/') + url;
  }

  getStudySearches () {
    const { study } = this.props;
    const { searchUrls } = study;
    const searches = Object
      .entries(searchUrls)
      .map(([ type, url ]) => ({ type, url: this.makeAppUrl(url) }));
    return searches;
  }

  renderSearchLink ({ type, url }) {
    const { study } = this.props;
    const name = getSearchNameByType(type);
    const icon = getSearchIconByType(type);

    const tooltip = (<span>Search <b>{name}</b> in the {study.name} Study</span>);
    return (
      <AnchoredTooltip
        fadeOut={true}
        content={tooltip}
        style={{ pointerEvents: 'none' }}>
        <a name={`Search ${name}`} href={url} key={type}>
          <Icon fa={icon} />
        </a>
      </AnchoredTooltip>
    );
  }

  render () {
    const { study } = this.props;
    const { name, disabled } = study;
    const href = this.getStudyUrl();
    const searches = this.getStudySearches();
    const SearchLink = this.renderSearchLink;

    return (
      <row className={'StudyMenuItem' + (disabled ? ' StudyMenuItem--disabled' : '')}>
        <box className="grow-1">
          <a href={href}>
            {name}
          </a>
        </box>
        <row className="grow-0 StudyMenuItem-Links">
          {searches.map(({ type, url }) => <SearchLink key={type} type={type} url={url} />)}
        </row>
      </row>
    )
  }
};

export default StudyMenuItem;
