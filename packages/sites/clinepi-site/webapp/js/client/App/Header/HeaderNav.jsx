import React from 'react';
import PropTypes from 'prop-types';

import './HeaderNav.scss';
import SiteMenu from 'Client/App/SiteMenu';
import UserMenu from 'Client/App/UserMenu';
import menuItems from 'Client/data/menuItems';

import { Events, BodyLayer } from 'mesa';
import { IconAlt as Icon } from 'wdk-client/Components';
import { formatReleaseDate } from 'ebrc-client/util/formatters';

class HeaderNav extends React.Component {
  constructor (props) {
    super(props);
    this.state = { stickyHeaderVisible: false }

    this.onScroll = this.onScroll.bind(this);
    this.getIconByType = this.getIconByType.bind(this);
    this.renderBranding = this.renderBranding.bind(this);
    this.renderIconMenu = this.renderIconMenu.bind(this);
    this.renderIconMenuItem = this.renderIconMenuItem.bind(this);
    this.renderStickyHeader = this.renderStickyHeader.bind(this);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentDidMount () {
    this.scrollListener = Events.add('scroll', this.onScroll);
  }

  componentWillUnmount () {
    Events.remove(this.scrollListener);
  }

  onScroll () {
    const threshold = 98;
    const { pageYOffset } = window;
    const { stickyHeaderVisible } = this.state;
    if (pageYOffset >= threshold && !stickyHeaderVisible)
      this.setState({ stickyHeaderVisible: true });
    else if (pageYOffset < threshold && stickyHeaderVisible)
      this.setState({ stickyHeaderVisible: false });
  }

  renderStickyHeader () {
    const { siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const logoUrl = webAppUrl + '/images/symbol-small.png';
    const bgUrl = webAppUrl + '/images/global.jpg';
    const { mainMenu, iconMenu } = menuItems(siteConfig);
    const IconMenu = this.renderIconMenu;
    return (
      <div className="HeaderNav-Sticky" style={{ backgroundImage: `url(${bgUrl})` }}>
        <div className="box">
          <img src={logoUrl} className="HeaderNav-Sticky-Logo" />
        </div>
        <div className="box">
          <h2 className="HeaderNav-Title">
            <a href={webAppUrl}>
              <mark>ClinEpi</mark>DB
            </a>
          </h2>
        </div>
        <div className="box grow-1">
          <SiteMenu items={mainMenu} config={siteConfig} />
        </div>
        <div className="box">
          <IconMenu items={iconMenu} />
        </div>
        <div className="box">
          <UserMenu webAppUrl={webAppUrl} actions={actions} user={user} />
        </div>
      </div>
    )
  }

  renderBranding ({ siteConfig }) {
    const { buildNumber, releaseDate, webAppUrl } = siteConfig;
    const logoUrl = webAppUrl + '/images/symbol-small.png';

    return (
      <div className="box row HeaderNav-Branding">
        <a className="box" href={webAppUrl}>
          <img src={logoUrl} className="HeaderNav-Logo" />
        </a>
        <div className="box stack">
          <h1 className="HeaderNav-Title">
            <a href={webAppUrl}>
              <mark>ClinEpi</mark>DB
            </a>
          </h1>
          <p>
            Clinical Epidemiology Resources <br />
            <small>
              {/* <code>Prototype</code>  */}
              Release {buildNumber} &nbsp; &nbsp;
              {formatReleaseDate(releaseDate, 'm d y')}
            </small>
          </p>
        </div>
      </div>
    );
  }

  getIconByType (type = '') {
    if (typeof type !== 'string' || !type.length) return 'globe';
    switch (type.toLowerCase()) {
      case 'facebook': return 'facebook-official';
      case 'twitter': return 'twitter';
      case 'youtube': return 'youtube-play';
      default: return type;
    }
  }

  renderIconMenuItem ({ type, url = '', name, text }) {
    const icon = this.getIconByType(type);
    return (
      <a
        href={url}
        target="_blank"
        name={name ? name : `Visit us on ${type}`}
        className="HeaderNav-Social-Link">
        <Icon fa={icon} />
        {!text ? null : text}
      </a>
    );
  }

  renderIconMenu ({ items }) {
    const IconMenuItem = this.renderIconMenuItem;
    return (
      <div className="row HeaderNav-Social nowrap">
        {items.map((props, index) => <IconMenuItem {...props} key={index} />)}
      </div>
    );
  }

  render () {
    const { stickyHeaderVisible } = this.state;
    const { siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const { mainMenu, iconMenu } = menuItems(siteConfig);

    const Branding = this.renderBranding;
    const IconMenu = this.renderIconMenu;

    const StickyHeader = this.renderStickyHeader;

    return (
      <div className="HeaderNav-Wrapper">
        <div className="row HeaderNav">
          {!stickyHeaderVisible ? null : (
            <BodyLayer>
              <StickyHeader />
            </BodyLayer>
          )}
          <Branding siteConfig={siteConfig} />
          <div className="HeaderNav-Switch">
            <div className="row HeaderNav-Primary">
              <SiteMenu items={mainMenu} config={siteConfig} />
            </div>

            <div className="row HeaderNav-Secondary">
              <IconMenu items={iconMenu} />
              <UserMenu webAppUrl={webAppUrl} actions={actions} user={user} />
            </div>
          </div>
          <a href="http://eupathdb.org/eupathdb/" target="_blank">
            <img src={webAppUrl + '/images/partofeupath.png'} id="EuPathLogo" />
          </a>
        </div>
      </div>
    );
  }
};

export default HeaderNav;
