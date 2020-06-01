import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { Link } from 'wdk-client/Components';
import { Props } from 'wdk-client/Components/Layout/Page';
import { ErrorBoundary } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import Announcements from 'ebrc-client/components/Announcements';
import CookieBanner from 'ebrc-client/components/CookieBanner';
import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header, HeaderMenuItem } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { useAnnouncementsState } from 'ebrc-client/hooks/announcements';
import { STATIC_ROUTE_PATH } from 'ebrc-client/routes';

import './OrthoMCLPage.scss';

const cx = makeClassNameHelper('vpdb-');

export const OrthoMCLPage: FunctionComponent<Props> = props => {
  useHomePageTitle();

  const menuItems = useHeaderMenuItems();

  const {
    closedBanners,
    setClosedBanners,
    showAnnouncementsToggle,
    onShowAnnouncements
  } = useAnnouncements();

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
          onShowAnnouncements={onShowAnnouncements}
          showAnnouncementsToggle={showAnnouncementsToggle}
          branding={branding}
        />
      </ErrorBoundary>
      <div className={cx('Announcements')}>
        <Announcements
          closedBanners={closedBanners}
          setClosedBanners={setClosedBanners}
        />
      </div>
      <Main containerClassName={cx('Main')}>
        {props.children}
      </Main>
      <ErrorBoundary>
        <Footer containerClassName={cx('Footer')}>
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

function useHomePageTitle() {
  const isHomePage = useIsHomePage();
  const displayName = useDisplayName();

  useEffect(() => {
    if (isHomePage && displayName != null) {
      document.title = displayName;
    }
  }, [ isHomePage, displayName ]);
}

function useHeaderMenuItems() {
  return useMemo(() => {
    const menuItems: HeaderMenuItem[] = [
      {
        key: 'my-strategies',
        display: 'My Strategies',
        type: 'reactRoute',
        url: '/workspace/strategies'
      },
      {
        key: 'searches',
        display: 'Searches',
        type: 'subMenu',
        items: [ makeTodoItem('searches-content') ]
      },
      {
        key: 'my-workspace',
        display: 'My Workspace',
        type: 'subMenu',
        items: [
          {
            key: 'galaxy-analyses',
            display: 'Analyze my data (Galaxy)',
            type: 'reactRoute',
            url: '/galaxy-orientation'
          },
          {
            key: 'basket',
            display: 'Basket',
            type: 'reactRoute',
            url: '/workspace/basket'
          },
          {
            key: 'favorites',
            display: 'Favorites',
            type: 'reactRoute',
            url: '/workspace/favorites',
          }
        ]
      },
      {
        key: 'tools',
        display: 'Tools',
        type: 'subMenu',
        items: [
          {
            key: 'blast',
            display: 'BLAST',
            type: 'reactRoute',
            url: '/search/sequence/ByBlast'
          },
          {
            key: 'proteome-upload',
            display: 'Assign your proteins to groups - TODO',
            type: 'reactRoute',
            url: '/proteome-upload'
          },
          {
            key: 'downloads',
            display: 'Download OrthoMCL software',
            type: 'reactRoute',
            url: '/downloads'
          },
          {
            key: 'web-services',
            display: 'Web services',
            type: 'reactRoute',
            url: makeStaticPageRoute(`/content/OrthoMCL/webServices.html`)
          },
          {
            key: 'publications',
            display: 'Publications mentioning OrthoMCL',
            type: 'externalLink',
            target: '_blank',
            url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
          }
        ]
      },
      {
        key: 'data',
        display: 'Data',
        type: 'subMenu',
        items: [
          {
            key: 'genome-statistics',
            display: 'Genome Statistics - TODO',
            type: 'reactRoute',
            url: '/genome-statistics'
          },
          {
            key: 'genome-sources',
            display: 'Genome Sources - TODO',
            type: 'reactRoute',
            url: '/genome-sources'
          }
        ]
      },
      {
        key: 'help',
        display: 'Help',
        type: 'subMenu',
        items: [ makeTodoItem('help-content') ]
      },
      {
        key: 'about',
        display: 'About',
        type: 'subMenu',
        items: [ makeTodoItem('about-content') ]
      },
      {
        key: 'contact-us',
        display: 'Contact Us',
        type: 'reactRoute',
        url: '/contact-us'
      }
    ];

    return menuItems;
  }, []);
}

function makeTodoItem(key: string): HeaderMenuItem {
  return {
    key,
    display: <div>TODO</div>,
    type: 'custom'
  };
}

function makeStaticPageRoute(url: string) {
  return `${STATIC_ROUTE_PATH}${url}`;
}

function useAnnouncements() {
  const isHomePage = useIsHomePage();
  const [ closedBanners, setClosedBanners ] = useAnnouncementsState();

  const showAnnouncementsToggle = useMemo(
    () => isHomePage && closedBanners.length > 0,
    [ isHomePage, closedBanners ]
  );

  const onShowAnnouncements = useCallback(() => {
    setClosedBanners([]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [ setClosedBanners ]);

  return {
    closedBanners,
    setClosedBanners,
    showAnnouncementsToggle,
    onShowAnnouncements
  };
}
