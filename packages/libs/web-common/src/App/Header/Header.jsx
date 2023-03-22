import React from 'react';
import { connect } from 'react-redux';
import { Hero } from 'ebrc-client/App/Hero';
import { requestStudies } from 'ebrc-client/App/Studies/StudyActionCreators';
import { UserActions, UserSessionActions } from '@veupathdb/wdk-client/lib/Actions';

import './Header.scss';

import HeaderNav from './HeaderNav';

const enhance = connect(
  (state, props) => {
    const { getSiteData, makeHeaderMenuItems } = props;
    const headerMenuItems = makeHeaderMenuItems(state, props);
    const siteData = getSiteData(state);
    const { dataRestriction, globalData } = state;
    const { user = {}, config, siteConfig, preferences } = globalData;
    return { user, config, siteConfig, preferences, siteData, dataRestriction, headerMenuItems };
  },
  { ...UserActions, ...UserSessionActions, requestStudies },
  (stateProps, actions, ownProps ) => {
    return { ...stateProps, ...ownProps, actions };
  }
);

class Header extends React.Component {

  componentDidMount() {
    this.props.actions.requestStudies();
  }

  render () {
    const {
      headerMenuItems,
      config,
      siteConfig,
      siteData,
      user,
      actions,
      heroImageUrl,
      heroImagePosition,
      titleWithoutDB,
      subTitle,
      tagline,
      logoUrl,
    } = this.props;
    const { rootUrl } = siteConfig;
    const { pathname } = window.location;
    const showHomeContent = (rootUrl === pathname || (rootUrl + '/') === pathname);

    return (
      <header className={'Header' + (showHomeContent ? ' Header--Home' : '')}>
        <Hero image={heroImageUrl} position={heroImagePosition}>
          <HeaderNav
            actions={actions}
            headerMenuItems={headerMenuItems}
            config={config}
            siteConfig={siteConfig}
            siteData={siteData}
            user={user}
            titleWithoutDB={titleWithoutDB}
            subTitle={subTitle}
            logoUrl={logoUrl}
            heroImageUrl={heroImageUrl}
            tagline={tagline}
          />
        </Hero>
      </header>
    );
  }
}

export default enhance(Header);
