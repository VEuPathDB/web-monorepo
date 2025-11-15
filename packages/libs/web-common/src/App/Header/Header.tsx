import React from 'react';
import { connect } from 'react-redux';
import { Hero } from '../../App/Hero';
import { requestStudies } from '../../App/Studies/StudyActionCreators';
import {
  UserActions,
  UserSessionActions,
} from '@veupathdb/wdk-client/lib/Actions';

import './Header.scss';

import HeaderNav from './HeaderNav';

interface HeaderOwnProps {
  getSiteData: (state: any) => any;
  makeHeaderMenuItems: (state: any, props: any) => any;
  heroImageUrl: string;
  heroImagePosition: string;
  titleWithoutDB: string;
  subTitle: string;
  tagline: string;
  logoUrl: string;
}

interface HeaderStateProps {
  user: any;
  config: any;
  siteConfig: any;
  preferences: any;
  siteData: any;
  dataRestriction: any;
  headerMenuItems: any;
}

interface HeaderDispatchProps {
  actions: typeof UserActions &
    typeof UserSessionActions & {
      requestStudies: typeof requestStudies;
    };
}

type HeaderProps = HeaderOwnProps & HeaderStateProps & HeaderDispatchProps;

const enhance = connect(
  (state: any, props: HeaderOwnProps) => {
    const { getSiteData, makeHeaderMenuItems } = props;
    const headerMenuItems = makeHeaderMenuItems(state, props);
    const siteData = getSiteData(state);
    const { dataRestriction, globalData } = state;
    const { user = {}, config, siteConfig, preferences } = globalData;
    return {
      user,
      config,
      siteConfig,
      preferences,
      siteData,
      dataRestriction,
      headerMenuItems,
    };
  },
  { ...UserActions, ...UserSessionActions, requestStudies },
  (stateProps: any, actions: any, ownProps: any) => {
    return { ...stateProps, ...ownProps, actions };
  }
);

class Header extends React.Component<HeaderProps> {
  componentDidMount() {
    this.props.actions.requestStudies();
  }

  render() {
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
    const showHomeContent = rootUrl === pathname || rootUrl + '/' === pathname;

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
