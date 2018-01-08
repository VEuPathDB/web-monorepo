import React from 'react';

import './HeaderNav.scss';
import NavMenu from 'Client/App/NavMenu';
import UserMenu from 'Client/App/UserMenu';
import menuItems from 'Client/data/menuItems';

import { IconAlt as Icon } from 'wdk-client/Components';

class HeaderNav extends React.Component {
  constructor (props) {
    super(props);
    this.getIconByType = this.getIconByType.bind(this);
    this.renderBranding = this.renderBranding.bind(this);
    this.renderIconMenu = this.renderIconMenu.bind(this);
    this.renderIconMenuItem = this.renderIconMenuItem.bind(this);
  }

  renderBranding ({ siteConfig }) {
    const { buildNumber, releaseDate, webAppUrl } = siteConfig;
    const logoUrl = webAppUrl + '/images/symbol-small.png';

    return (
      <row className="box HeaderNav-Branding">
        <a className="box" href={webAppUrl}>
          <img src={logoUrl} className="HeaderNav-Logo" />
        </a>
        <stack className="box">
          <h1 className="HeaderNav-Title">
            <a href={webAppUrl}>
              <mark>ClinEpi</mark>DB
            </a>
          </h1>
          <p>
            Clinical Epidemiology Resources <br />
            <small><code>Prototype</code> Release {buildNumber} {' :: '} {releaseDate}</small>
          </p>
        </stack>
      </row>
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
    const { siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const Branding = this.renderBranding;
    const IconMenu = this.renderIconMenu;
    const { mainMenu, iconMenu } = menuItems(siteConfig);

    return (
      <div className="row HeaderNav">
        <Branding siteConfig={siteConfig} />
        <div className="HeaderNav-Switch">
          <row className="HeaderNav-Primary">
            <NavMenu items={mainMenu} config={siteConfig} />
          </row>
          <row className="HeaderNav-Secondary">
            <IconMenu items={iconMenu} />
            <UserMenu webAppUrl={webAppUrl} actions={actions} user={user} />
          </row>
        </div>
      </div>
    );
  }
};

export default HeaderNav;
