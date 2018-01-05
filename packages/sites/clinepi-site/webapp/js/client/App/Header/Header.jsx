import React from 'react';

import './Header.scss';

import HeaderNav from './HeaderNav';
import { Hero } from 'Client/App/Hero';

import getCopy from 'Client/data/Copy';

class Header extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { siteConfig, user, actions } = this.props;
    const { webAppUrl } = siteConfig;
    const Copy = getCopy(webAppUrl);

    const { pathname, protocol, host } = window.location;
    const homepath = webAppUrl + '/app';
    const actualPath = protocol + '//' + host + pathname;
    const showHomeContent = (actualPath === homepath);

    return (
      <header className={'Header' + (showHomeContent ? ' Header--Home' : '')}>
        <Hero image={Copy.heroImage} position={Copy.heroPosition}>
          <HeaderNav actions={actions} siteConfig={siteConfig} user={user} />
          {!showHomeContent
            ? null
            : (
              <div>
                <h1 dangerouslySetInnerHTML={{ __html: Copy.heading }} />
                <h3 dangerouslySetInnerHTML={{ __html: Copy.tagline }} />
              </div>
            )
          }
        </Hero>
      </header>
    );
  }
};

export default Header;
