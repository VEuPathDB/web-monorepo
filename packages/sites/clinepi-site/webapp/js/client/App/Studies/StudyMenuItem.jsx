import React from 'react';

import './StudyMenu.scss';
import { IconAlt as Icon, Link, Mesa } from 'wdk-client/Components';
import { getSearchIconByType, getSearchNameByType } from 'Client/App/Searches/SearchUtils';

class StudyMenuItem extends React.Component {
  constructor (props) {
    super(props);
    this.makeAppUrl = this.makeAppUrl.bind(this);
    this.getStudySearches = this.getStudySearches.bind(this);
    this.renderSearchLink = this.renderSearchLink.bind(this);
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
      <Mesa.AnchoredTooltip
        fadeOut={true}
        content={tooltip}
        style={{ pointerEvents: 'none' }}>
        <a name={`Search ${name}`} href={url} key={type}>
          <Icon fa={icon} />
        </a>
      </Mesa.AnchoredTooltip>
    );
  }

  render () {
    const { study } = this.props;
    const { name, disabled, route } = study;
    const searches = this.getStudySearches();
    const SearchLink = this.renderSearchLink;

    return (
      <div className={'row StudyMenuItem' + (disabled ? ' StudyMenuItem--disabled' : '')}>
        <div className="box StudyMenuItem-Name">
          <Link to={route} className="StudyMenuItem-RecordLink">
            {name}
            <Icon fa="angle-double-right" />
          </Link>
        </div>
        <div className="row StudyMenuItem-Links">
          {searches.map(({ type, url }) => <SearchLink key={type} type={type} url={url} />)}
        </div>
      </div>
    )
  }
};

export default StudyMenuItem;
