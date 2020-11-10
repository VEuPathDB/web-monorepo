import React from 'react';
import { connect } from 'react-redux';
import { IconAlt as Icon, Link, Mesa } from 'wdk-client/Components';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { isPrereleaseStudy } from 'ebrc-client/App/DataRestriction/DataRestrictionUtils';
import './StudyMenu.scss';

class StudyMenuItem extends React.Component {
  constructor (props) {
    super(props);
    this.makeAppUrl = this.makeAppUrl.bind(this);
    this.renderSearchLink = this.renderSearchLink.bind(this);
  }

  makeAppUrl (url) {
    const { config } = this.props;
    const { webAppUrl } = config;
    return (webAppUrl ? webAppUrl : '') + (!url.indexOf('/') ? '' : '/') + url;
  }

  renderSearchLink ({ displayName, icon, path }) {
    const { study } = this.props;

    const route = `/search/${path}`;

    const tooltip = (<span>Search <b>{displayName}</b> in the {safeHtml(study.name)} Study</span>);
    return (
      <Mesa.AnchoredTooltip
        fadeOut={true}
        content={tooltip}
        style={{ pointerEvents: 'none' }}>
        <Link name={`Search ${displayName}`} to={route} key={path}>
          <i className={icon} />
        </Link>
      </Mesa.AnchoredTooltip>
    );
  }

  render () {
    const { study, user, permissions } = this.props;
    const { name, id, disabled, route, searches } = study;
    const SearchLink = this.renderSearchLink;

    return (
      <div className={'row StudyMenuItem' + (disabled ? ' StudyMenuItem--disabled' : '')}>
        <div className="box StudyMenuItem-Name">
          <Link to={route} className={'StudyMenuItem-RecordLink ' + id}>
            {safeHtml(name)}
            <Icon fa="angle-double-right" />
          </Link>
        </div>
        <div className="row StudyMenuItem-Links">
        { (!isPrereleaseStudy(study.access, study.id, user, permissions))
          ? searches.map(({ path, displayName, icon }) => <SearchLink key={path} path={path} displayName={displayName} icon={icon} />)
          : (
             <div className="prerelease">
               <small>(coming soon)</small>
             </div>
            )
        }
        </div>
      </div>
    )
  }
}

export default connect( state => ({user: state.globalData.user}) )(StudyMenuItem);

