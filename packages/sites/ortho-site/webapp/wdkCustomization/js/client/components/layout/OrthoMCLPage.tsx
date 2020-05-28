import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { noop } from 'lodash';

import { Link } from 'wdk-client/Components';
import { Props } from 'wdk-client/Components/Layout/Page';
import { ErrorBoundary } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import Announcements from 'ebrc-client/components/Announcements';
import CookieBanner from 'ebrc-client/components/CookieBanner';
import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';

import './OrthoMCLPage.scss';

const cx = makeClassNameHelper('vpdb-');

export const OrthoMCLPage: FunctionComponent<Props> = props => {
  useHomePageTitle();

  const displayName = useDisplayName();
  const buildNumber = useBuildNumber();
  const releaseDate = useReleaseDate();

  const menuItems = useMemo(() => [], []);
  const closedBanners = useMemo(() => [], []);

  const branding = (
    <Link to="/">
      <div className="vpdb-HeaderBranding">
      </div>
    </Link>
  );

  return (
    <div className={cx('RootContainer', props.classNameModifier)}>
      <ErrorBoundary>
        <Header
          menuItems={menuItems}
          containerClassName={cx('Header', 'expanded')}
          onShowAnnouncements={noop}
          showAnnouncementsToggle={false}
          branding={branding}
        />
      </ErrorBoundary>
      <div className={cx('Announcements')}>
        <Announcements
          closedBanners={closedBanners}
          setClosedBanners={noop}
        />
      </div>
      <Main containerClassName={cx('Main')}>
        {props.children}
      </Main>
      <ErrorBoundary>
        <Footer
          containerClassName={cx('Footer')}
          buildNumber={buildNumber}
          releaseDate={releaseDate}
          displayName={displayName}
        >
        </Footer>
      </ErrorBoundary>
      <ErrorBoundary>
        <CookieBanner/>
      </ErrorBoundary>
    </div>
  );
}

function useIsHomePage() {
  const location = useLocation();
  return location.pathname === '/';
}

function useDisplayName() {
  return useSelector((state: RootState) => state.globalData.config?.displayName);
}

function useBuildNumber() {
  return useSelector((state: RootState) => state.globalData.config?.buildNumber);
}

function useReleaseDate() {
  return useSelector((state: RootState) => state.globalData.config?.releaseDate);
}

function useHomePageTitle() {
  const isHomePage = useIsHomePage();
  const displayName = useDisplayName();

  useEffect(() => {
    if (isHomePage && displayName != null) {
      document.title = displayName;
    }
  }, [ isHomePage, displayName ]);
}
