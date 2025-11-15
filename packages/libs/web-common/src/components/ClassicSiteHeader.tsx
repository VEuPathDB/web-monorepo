import React from 'react';
import { connect } from 'react-redux';
import * as UserSessionActions from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import * as UserActions from '@veupathdb/wdk-client/lib/Actions/UserActions';
import { Sticky } from '@veupathdb/wdk-client/lib/Components';
import { formatReleaseDate } from '../util/formatters';
import { makeMenuItems } from '../util/menuItems';
import QuickSearch from './QuickSearch';
import SmallMenu, { SmallMenuItem } from './SmallMenu';
import Menu from './Menu';
import {
  loadBasketCounts,
  loadQuickSearches,
} from '../actioncreators/GlobalActionCreators';

interface User {
  isGuest: boolean;
  [key: string]: any;
}

interface SiteConfig {
  projectId: string;
  webAppUrl: string;
}

interface Config {
  buildNumber?: string;
  releaseDate?: string;
}

interface QuickSearchReference {
  name: string;
  [key: string]: any;
}

interface QuickSearchQuestion {
  name?: string;
  [key: string]: any;
}

interface ClassicSiteHeaderProps {
  user?: User;
  ontology?: any;
  recordClasses?: any[];
  basketCounts?: any;
  quickSearches?: QuickSearchQuestion[];
  quickSearchReferences?: QuickSearchReference[];
  preferences?: any;
  location?: any;
  siteConfig: SiteConfig;
  config?: Config;
  showLoginForm: () => void;
  showLoginWarning: () => void;
  showLogoutWarning: () => void;
  makeSmallMenuItems?: (props: any, menuItems: any) => SmallMenuItem[];
  makeMainMenuItems?: (props: any, menuItems: any) => any[];
  loadBasketCounts: () => void;
  loadQuickSearches: (references: QuickSearchReference[]) => void;
  isPartOfEuPathDB?: boolean;
}

/** Site header */
const enhance = connect((state: any) => state.globalData, {
  ...UserSessionActions,
  ...UserActions,
  loadBasketCounts,
  loadQuickSearches,
});

class ClassicSiteHeader extends React.Component<ClassicSiteHeaderProps> {
  componentDidMount() {
    const { quickSearchReferences } = this.props;
    if (quickSearchReferences != null)
      this.props.loadQuickSearches(quickSearchReferences);
    this.props.loadBasketCounts();
  }

  render() {
    const {
      quickSearches,
      quickSearchReferences,
      user,
      showLoginWarning,
      siteConfig,
      config = {},
      makeSmallMenuItems,
      makeMainMenuItems,
      isPartOfEuPathDB = true,
    } = this.props;

    const { projectId, webAppUrl } = siteConfig;

    const { buildNumber, releaseDate } = config;

    const menuItems = makeMenuItems(this.props);
    const mainMenuItems =
      makeMainMenuItems && makeMainMenuItems(this.props, menuItems);
    const smallMenuItems =
      makeSmallMenuItems && makeSmallMenuItems(this.props, menuItems);

    return (
      <React.Fragment>
        <link
          rel="stylesheet"
          type="text/css"
          href={`${webAppUrl}/css/${projectId}.css`}
        />
        <div id="header">
          <div id="header2">
            <div id="header_rt">
              <div id="toplink">
                {isPartOfEuPathDB && (
                  <a href="http://eupathdb.org">
                    <img
                      alt="Link to EuPathDB homepage"
                      src={
                        webAppUrl + '/images/' + projectId + '/partofeupath.png'
                      }
                    />
                  </a>
                )}
              </div>
              <QuickSearch
                webAppUrl={webAppUrl}
                references={quickSearchReferences}
                questions={quickSearches}
              />
              <SmallMenu webAppUrl={webAppUrl} items={smallMenuItems} />
            </div>
            <div className="eupathdb-Logo">
              <a href="/">
                <img
                  className="eupathdb-LogoImage"
                  alt={'Link to ' + projectId + ' homepage'}
                  src={webAppUrl + '/images/' + projectId + '/title_s.png'}
                />
              </a>
              <span className="eupathdb-LogoRelease">
                Release {buildNumber}
                <br />
                {releaseDate && formatReleaseDate(releaseDate)}
              </span>
            </div>
          </div>
          {/* TODO Put items into an external JSON file. */}
          <Sticky>
            {({ isFixed }: { isFixed: boolean }) => (
              <div
                className={
                  'eupathdb-MenuContainer' +
                  (isFixed ? ' eupathdb-MenuContainer__fixed' : '')
                }
              >
                <Menu
                  webAppUrl={webAppUrl}
                  projectId={projectId}
                  showLoginWarning={showLoginWarning}
                  isGuest={user ? user.isGuest : true}
                  items={mainMenuItems}
                />
              </div>
            )}
          </Sticky>
        </div>
      </React.Fragment>
    );
  }
}

export default enhance(ClassicSiteHeader);
