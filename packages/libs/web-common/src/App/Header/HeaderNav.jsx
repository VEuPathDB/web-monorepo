import React from 'react';
import SiteMenu from 'ebrc-client/App/SiteMenu';
import UserMenu from 'ebrc-client/App/UserMenu';
import { formatReleaseDate } from 'ebrc-client/util/formatters';
import { IconAlt as Icon, Link, Mesa } from '@veupathdb/wdk-client/lib/Components';
import partofveupath from '../../../images/partofveupath.png';

import './HeaderNav.scss';

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
    this.scrollListener = Mesa.Events.add('scroll', this.onScroll);
  }

  componentWillUnmount () {
    Mesa.Events.remove(this.scrollListener);
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
    const { headerMenuItems, siteConfig, user, actions, titleWithoutDB, logoUrl, heroImageUrl } = this.props;
    const { webAppUrl } = siteConfig;
    const { mainMenu, iconMenu } = headerMenuItems;
    const IconMenu = this.renderIconMenu;
    return (
      <div className="HeaderNav-Sticky" style={{ backgroundImage: `url(${heroImageUrl})` }}>
        <div className="box">
          <img src={logoUrl} className="HeaderNav-Sticky-Logo" />
        </div>
        <div className="box">
          <h2 className="HeaderNav-Title">
            <Link to="/" style={{ color: '#DD314E' }}>
              <mark>{titleWithoutDB}</mark>DB
            </Link>
          </h2>
        </div>
        <div className="box grow-1">
          <SiteMenu items={mainMenu} config={siteConfig}  actions={actions} user={user}/>
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

  renderBranding ({ config = {}, titleWithoutDB, subTitle, logoUrl }) {
    const { buildNumber, releaseDate } = config;

    return (
      <div className="box row HeaderNav-Branding">
        <Link to="/" className="box" >
          <img src={logoUrl} className="HeaderNav-Logo" />
        </Link>
        <div className="box stack">
          <h1 className="HeaderNav-Title">
            <Link to="/" style={{ color: '#DD314E' }}>
              <mark>{titleWithoutDB}</mark>DB
            </Link>
          </h1>
          <p>
            {subTitle} <br />
            <small>
              {/* <code>Prototype</code>  */}
              Release {buildNumber} &nbsp; &nbsp;
              {formatReleaseDate(releaseDate)}
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
      case 'vimeo': return 'vimeo-square';
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
    const { headerMenuItems, siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const { mainMenu, iconMenu } = headerMenuItems;

    const Branding = this.renderBranding;
    const IconMenu = this.renderIconMenu;

    const StickyHeader = this.renderStickyHeader;

    return (
      <div className="HeaderNav-Wrapper">
        <div className="row HeaderNav">
          {!stickyHeaderVisible ? null : (
            <Mesa.BodyLayer>
              <StickyHeader />
            </Mesa.BodyLayer>
          )}
          <Branding {...this.props} />
          <div className="HeaderNav-Switch">
            <div className="row HeaderNav-Primary">
              <SiteMenu items={mainMenu} config={siteConfig} actions={actions} user={user} />
            </div>

            <div className="row HeaderNav-Secondary">
              <IconMenu items={iconMenu} />
              <UserMenu webAppUrl={webAppUrl} actions={actions} user={user} />
            </div>
          </div>
          <a href="https://veupathdb.org" target="_blank">
            <img src={partofveupath} id="VEuPathLogo" />
          </a>
        </div>
      </div>
    );
  }
}

export default HeaderNav;
