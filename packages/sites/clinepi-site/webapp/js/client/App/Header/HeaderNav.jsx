import React from 'react';

import './HeaderNav.scss';
import NavMenu from 'Client/App/NavMenu';
import UserMenu from 'Client/App/UserMenu';
import menuItems from 'Client/data/menuItems';

import { IconAlt as Icon } from 'wdk-client/Components';

class HeaderNav extends React.Component {
  constructor (props) {
    super(props);
    this.getSocialIcon = this.getSocialIcon.bind(this);
    this.renderBranding = this.renderBranding.bind(this);
    this.renderSocialNav = this.renderSocialNav.bind(this);
    this.renderSocialIcon = this.renderSocialIcon.bind(this);
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

  getSocialIcon (type = '') {
    if (typeof type !== 'string' || !type.length) return 'globe';
    switch (type.toLowerCase()) {
      case 'facebook': return 'facebook-official';
      case 'twitter': return 'twitter';
      case 'youtube': return 'youtube-play';
      default: return 'globe';
    }
  }

  renderSocialIcon ({ type, url = '' }) {
    const icon = this.getSocialIcon(type);
    return (
      <a
        href={url}
        target="_blank"
        name={`Visit us on ${type}`}
        className="HeaderNav-Social-Link">
        <Icon fa={icon} />
      </a>
    );
  }

  renderSocialNav ({ siteConfig }) {
    const { facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
    const SocialIcon = this.renderSocialIcon;
    return (
      <div className="row HeaderNav-Social nowrap">
        <SocialIcon type="facebook" url={facebookUrl} />
        <SocialIcon type="twitter" url={twitterUrl} />
        <SocialIcon type="youtube" url={youtubeUrl} />
      </div>
    );
  }

  render () {
    const { siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const Branding = this.renderBranding;
    const SocialNav = this.renderSocialNav;

    return (
      <div className="row HeaderNav">
        <Branding siteConfig={siteConfig} />
        <div className="HeaderNav-Switch">
          <row className="HeaderNav-Primary">
            <NavMenu items={menuItems(webAppUrl)} config={siteConfig} />
          </row>
          <row className="HeaderNav-Secondary">
            <SocialNav siteConfig={siteConfig} />
            <UserMenu webAppUrl={webAppUrl} actions={actions} user={user} />
          </row>
        </div>
      </div>
    );
  }
};

export default HeaderNav;
