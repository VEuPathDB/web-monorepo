import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';
import { ReduxNotificationHandler } from '@veupathdb/wdk-client/lib/Components/Notifications';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import Announcements from '@veupathdb/web-common/lib/components/Announcements';
import CookieBanner from '@veupathdb/web-common/lib/components/CookieBanner';
import { Footer } from '@veupathdb/web-common/lib/components/homepage/Footer';
import { SearchCheckboxTree } from '@veupathdb/web-common/lib/components/homepage/SearchPane';
import {
  Header,
  HeaderMenuItem,
} from '@veupathdb/web-common/lib/components/homepage/Header';
import { Main } from '@veupathdb/web-common/lib/components/homepage/Main';
import { useAnnouncementsState } from '@veupathdb/web-common/lib/hooks/announcements';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';
import { useCommunitySiteRootUrl } from '@veupathdb/web-common/lib/hooks/staticData';
import { formatReleaseDate } from '@veupathdb/web-common/lib/util/formatters';

import makeSnackbarProvider, {
  SnackbarStyleProps,
} from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

import {
  useSearchTree,
  useSessionBackedSearchTerm,
  useSessionBackedExpandedBranches,
} from 'ortho-client/hooks/searchCheckboxTree';

import './OrthoMCLPage.scss';

const cx = makeClassNameHelper('vpdb-');

const SEARCH_TERM_SESSION_KEY = 'header-search-term';
const EXPANDED_BRANCHES_SESSION_KEY = 'header-expanded-branch-ids';

export const OrthoMCLPage: FunctionComponent<Props> = (props) => {
  useHomePageTitle();

  const isHeaderExpanded = useCollapsibleHeader();

  const menuItems = useHeaderMenuItems();

  const {
    closedBanners,
    setClosedBanners,
    showAnnouncementsToggle,
    onShowAnnouncements,
  } = useAnnouncements();

  const buildNumber = useSelector(
    (state: RootState) => state.globalData.config?.buildNumber
  );
  const releaseDate = useSelector(
    (state: RootState) => state.globalData.config?.releaseDate
  );

  const branding = (
    <>
      <Link to="/">
        <div className="vpdb-HeaderBranding"></div>
      </Link>
      <div className="vpdb-HeaderBrandingSuperscript">
        {buildNumber && <span>Release {buildNumber} </span>}
        <br />
        {releaseDate && formatReleaseDate(releaseDate)}
      </div>
    </>
  );

  const snackbarStyleProps = useMemo(
    () => ({ isHeaderExpanded }),
    [isHeaderExpanded]
  );

  return (
    <OrthoMCLSnackbarProvider styleProps={snackbarStyleProps}>
      <ReduxNotificationHandler>
        <div className={cx('RootContainer', props.classNameModifier)}>
          <ErrorBoundary>
            <Header
              menuItems={menuItems}
              containerClassName={cx(
                'Header',
                isHeaderExpanded ? 'expanded' : 'collapsed'
              )}
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
          <Main containerClassName={cx('Main')}>{props.children}</Main>
          <ErrorBoundary>
            <Footer containerClassName={cx('Footer')}></Footer>
          </ErrorBoundary>
          <ErrorBoundary>
            <CookieBanner />
          </ErrorBoundary>
        </div>
      </ReduxNotificationHandler>
    </OrthoMCLSnackbarProvider>
  );
};

function translateNotificationsOnTop({
  isHeaderExpanded,
}: SnackbarStyleProps<{ isHeaderExpanded: boolean }>) {
  return {
    transform: isHeaderExpanded ? 'translateY(112px)' : 'translateY(47px)',
  };
}

const OrthoMCLSnackbarProvider = makeSnackbarProvider(
  {
    containerRoot: {
      zIndex: 99,
    },
    anchorOriginTopLeft: translateNotificationsOnTop,
    anchorOriginTopCenter: translateNotificationsOnTop,
    anchorOriginTopRight: translateNotificationsOnTop,
  },
  'OrthoMCLSnackbarProvider'
);

function useIsHomePage() {
  const location = useLocation();
  return location.pathname === '/';
}

function useDisplayName() {
  return useSelector(
    (state: RootState) => state.globalData.config?.displayName
  );
}

function useHomePageTitle() {
  const isHomePage = useIsHomePage();
  const displayName = useDisplayName();

  useEffect(() => {
    if (isHomePage && displayName != null) {
      document.title = displayName;
    }
  }, [isHomePage, displayName]);
}

function useCollapsibleHeader() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  const updateHeader = useCallback(() => {
    setIsHeaderExpanded(
      document.body.scrollTop <= 80 && document.documentElement.scrollTop <= 80
    );
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('touch', updateHeader, { passive: true });
    window.addEventListener('wheel', updateHeader, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('touch', updateHeader);
      window.removeEventListener('wheel', updateHeader);
    };
  }, [updateHeader]);

  return isHeaderExpanded;
}

function useHeaderMenuItems() {
  const searchTree = useSearchTree();
  const [searchTerm, setSearchTerm] = useSessionBackedSearchTerm(
    '',
    SEARCH_TERM_SESSION_KEY
  );
  const [expandedBranches, setExpandedBranches] =
    useSessionBackedExpandedBranches([], EXPANDED_BRANCHES_SESSION_KEY);

  const searchTreeNode = useMemo(
    () => (
      <SearchCheckboxTree
        searchTree={searchTree}
        searchTerm={searchTerm}
        expandedBranches={expandedBranches}
        setSearchTerm={setSearchTerm}
        setExpandedBranches={setExpandedBranches}
        type="headerMenu"
      />
    ),
    [searchTree, searchTerm, expandedBranches]
  );

  const displayName = useDisplayName();
  const communitySite = useCommunitySiteRootUrl();

  return useMemo(() => {
    const menuItems: HeaderMenuItem[] = [
      {
        key: 'my-strategies',
        display: 'My Strategies',
        type: 'reactRoute',
        url: '/workspace/strategies',
      },
      {
        key: 'searches',
        display: 'Searches',
        type: 'subMenu',
        items: [
          {
            key: 'search-tree',
            display: searchTreeNode,
            type: 'custom',
          },
        ],
      },
      {
        key: 'tools',
        display: 'Tools',
        type: 'subMenu',
        items: [
          {
            key: 'proteome-upload',
            display: 'Map proteins to OrthoMCL with Diamond blastp',
            type: 'reactRoute',
            url: '/workspace/map-proteins/new',
          },
          {
            key: 'blast',
            display: 'BLAST',
            type: 'reactRoute',
            url: '/search/sequence/ByBlast',
          },
          {
            key: 'download-software',
            display: 'Download OrthoMCL software',
            type: 'reactRoute',
            url: '/downloads/software',
          },
          {
            key: 'publications',
            display: 'Publications mentioning OrthoMCL',
            type: 'externalLink',
            target: '_blank',
            url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en',
          },
          {
            key: 'web-services',
            display: 'Web services',
            type: 'reactRoute',
            url: makeStaticPageRoute(`/content/OrthoMCL/webServices.html`),
          },
        ],
      },
      {
        key: 'my-workspace',
        display: 'My Workspace',
        type: 'subMenu',
        items: [
          {
            key: 'galaxy-analyses',
            display: 'Assign my proteins to groups in Galaxy',
            type: 'reactRoute',
            url: '/galaxy-orientation',
          },
          {
            key: 'basket',
            display: 'My baskets',
            type: 'reactRoute',
            url: '/workspace/basket',
          },
          {
            key: 'favorites',
            display: 'My favorites',
            type: 'reactRoute',
            url: '/workspace/favorites',
          },
          {
            key: 'public-strategies',
            display: 'Public search strategies',
            type: 'reactRoute',
            url: '/workspace/strategies/public',
          },
        ],
      },

      {
        key: 'data',
        display: 'Data',
        type: 'subMenu',
        items: [
          {
            key: 'data-methods',
            display: 'Analysis methods',
            type: 'reactRoute',
            tooltip: 'How we obtain/generate the data',
            url: makeStaticPageRoute(`/OrthoMCL/about.html`),
          },
          {
            key: 'downloads',
            display: 'Download data files',
            type: 'reactRoute',
            url: '/downloads',
          },
          {
            key: 'release-summary',
            display: 'Proteome Sources and Statistics',
            type: 'reactRoute',
            url: '/release-summary',
          },
        ],
      },
      {
        key: 'about',
        display: 'About',
        type: 'subMenu',
        items: [
          {
            key: 'what-is',
            display: `What is VEuPathDB?`,
            type: 'reactRoute',
            url: makeStaticPageRoute('/about.html'),
          },
          {
            key: 'what-is-ortho',
            display: `What is OrthoMCL?`,
            type: 'reactRoute',
            url: makeStaticPageRoute('/OrthoMCL/about.html'),
          },
          {
            key: 'switchsites',
            display: 'VEuPathDB sites',
            type: 'subMenu',
            items: [
              {
                key: 'veupathdb',
                display: 'VEuPathDB',
                type: 'externalLink',
                url: 'https://veupathdb.org',
                target: '_blank',
              },
              {
                key: 'amoebadb',
                display: 'AmoebaDB',
                type: 'externalLink',
                url: 'https://amoebadb.org',
                target: '_blank',
              },
              {
                key: 'cryptodb',
                display: 'CryptoDB',
                type: 'externalLink',
                url: 'https://cryptodb.org',
                target: '_blank',
              },
              {
                key: 'fungidb',
                display: 'FungiDB',
                type: 'externalLink',
                url: 'https://fungidb.org',
                target: '_blank',
              },
              {
                key: 'giardiadb',
                display: 'GiardiaDB',
                type: 'externalLink',
                url: 'https://giardiadb.org',
                target: '_blank',
              },
              {
                key: 'hostdb',
                display: 'HostDB',
                type: 'externalLink',
                url: 'https://hostdb.org',
                target: '_blank',
              },
              {
                key: 'microsporidiadb',
                display: 'MicrosporidiaDB',
                type: 'externalLink',
                url: 'https://microsporidiadb.org',
                target: '_blank',
              },
              {
                key: 'piroplasmadb',
                display: 'PiroplasmaDB',
                type: 'externalLink',
                url: 'https://piroplasmadb.org',
                target: '_blank',
              },
              {
                key: 'plasmodb',
                display: 'PlasmoDB',
                type: 'externalLink',
                url: 'https://plasmodb.org',
                target: '_blank',
              },
              {
                key: 'toxodb',
                display: 'ToxoDB',
                type: 'externalLink',
                url: 'https://toxodb.org',
                target: '_blank',
              },
              {
                key: 'trichdb',
                display: 'TrichDB',
                type: 'externalLink',
                url: 'https://trichdb.org',
                target: '_blank',
              },
              {
                key: 'tritrypdb',
                display: 'TriTrypDB',
                type: 'externalLink',
                url: 'https://tritrypdb.org',
                target: '_blank',
              },
              {
                key: 'vectorbase',
                display: 'VectorBase',
                type: 'externalLink',
                url: 'https://vectorbase.org',
                target: '_blank',
              },
              {
                key: 'orthomcl',
                display: 'OrthoMCL',
                type: 'externalLink',
                url: 'https://orthomcl.org',
                target: '_blank',
              },
            ],
          },
          {
            key: 'community',
            type: 'subMenu',
            display: 'Community',
            items: [
              {
                key: 'news',
                display: 'News',
                type: 'reactRoute',
                url: makeStaticPageRoute(`/${displayName}/news.html`),
              },
              {
                key: 'public-strategies',
                display: 'Public strategies',
                type: 'reactRoute',
                url: '/workspace/strategies/public',
              },
              {
                key: 'related-sites',
                display: 'Related sites',
                type: 'reactRoute',
                url: makeStaticPageRoute(`/${displayName}/externalLinks.html`),
              },
            ],
          },
          {
            key: 'pubs',
            type: 'subMenu',
            display: 'Publications',
            items: [
              {
                key: 'eupathdb-publications',
                display: 'Publications on VEuPathDB sites',
                type: 'reactRoute',
                url: makeStaticPageRoute('/veupathPubs.html'),
              },
              {
                key: 'citations',
                display: 'Publications that use our resources',
                type: 'externalLink',
                url: 'https://scholar.google.com/scholar?hl=en&as_sdt=0,39&q=OrthoMCL+OR+PlasmoDB+OR+ToxoDB+OR+CryptoDB+OR+TrichDB+OR+GiardiaDB+OR+TriTrypDB+OR+AmoebaDB+OR+MicrosporidiaDB+OR+%22FungiDB%22+OR+PiroplasmaDB+OR+%22vectorbase%22+OR+veupathdb+OR+ApiDB+OR+EuPathDB+-encrypt+-cryptography+-hymenoptera&scisbd=1',
                target: '_blank',
              },
            ],
          },
          {
            key: 'usage-and-citations',
            display: 'Usage and citation',
            type: 'subMenu',
            items: [
              {
                key: 'cite',
                display: 'Citing VEuPathDB in Publications and Presentations',
                type: 'reactRoute',
                url: makeStaticPageRoute('/about.html#about_citing'),
              },
              {
                key: 'data-access-policy',
                display: 'Data access policy',
                type: 'reactRoute',
                url: makeStaticPageRoute('/about.html#about_use'),
              },
              {
                key: 'website-privacy-policy',
                display: 'Website privacy policy',
                type: 'reactRoute',
                url: makeStaticPageRoute('/privacyPolicy.html'),
              },
            ],
          },
          {
            key: 'who-are-we',
            display: 'Who we are',
            type: 'subMenu',
            items: [
              {
                key: 'personnel',
                display: 'Personnel',
                type: 'reactRoute',
                url: makeStaticPageRoute('/personnel.html'),
              },
              {
                key: 'acknowledgement',
                display: 'Acknowledgements',
                type: 'reactRoute',
                url: makeStaticPageRoute('/acks.html'),
              },
              {
                key: 'funding',
                display: 'Funding',
                type: 'reactRoute',
                url: makeStaticPageRoute('/about.html#about_funding'),
              },
            ],
          },
          {
            key: 'technical',
            display: 'Technical information',
            type: 'subMenu',
            items: [
              {
                key: 'accessibility-vpat',
                display: 'Accessibility VPAT',
                type: 'externalLink',
                url: '/documents/VEuPathDB_Section_508_BRC4.pdf',
              },
              {
                key: 'infrastructure',
                display: 'Infrastructure',
                type: 'reactRoute',
                url: makeStaticPageRoute('/infrastructure.html'),
              },
              {
                key: 'tech-methods',
                display: 'VEuPathDB Analysis methods',
                type: 'reactRoute',
                tooltip: 'How we obtain/generate the data',
                url: makeStaticPageRoute(`/methods.html`),
              },
              {
                key: 'usage-statistics',
                display: 'Website usage statistics',
                type: 'externalLink',
                url: '/awstats/awstats.pl',
                target: '_blank',
              },
            ],
          },
        ],
      },
      {
        key: 'help',
        display: 'Help',
        type: 'subMenu',
        items: [
          {
            key: 'faq',
            display: 'FAQ',
            type: 'reactRoute',
            url: makeStaticPageRoute('/OrthoMCL/faq.html'),
          },
          {
            key: 'landing',
            display: 'Learn how to use VEuPathDB',
            type: 'reactRoute',
            url: makeStaticPageRoute('/landing.html'),
          },
          {
            key: 'reset-session',
            display: `Reset ${displayName} session`,
            tooltip: 'Login first to keep your work',
            type: 'reactRoute',
            url: '/reset-session',
          },
          {
            key: 'user-doc',
            display: 'Downloadable User documentation',
            type: 'externalLink',
            url: '/reports/VEuPathDB_User_Documentation.pdf',
          },
        ],
      },
      {
        key: 'contact-us',
        display: 'Contact Us',
        type: 'reactRoute',
        url: '/contact-us',
        target: '_blank',
      },
    ];

    return menuItems;
  }, [searchTreeNode]);
}

function makeTodoItem(key: string): HeaderMenuItem {
  return {
    key,
    display: <div>TODO</div>,
    type: 'custom',
  };
}

function makeStaticPageRoute(url: string) {
  return `${STATIC_ROUTE_PATH}${url}`;
}
function makeExternalStaticPageUrl(
  communitySiteUrl: string | undefined,
  subPath: string
) {
  return `https://${communitySiteUrl}${subPath}`;
}

function useAnnouncements() {
  const isHomePage = useIsHomePage();
  const [closedBanners, setClosedBanners] = useAnnouncementsState();

  const showAnnouncementsToggle = useMemo(
    () => isHomePage && closedBanners.length > 0,
    [isHomePage, closedBanners]
  );

  const onShowAnnouncements = useCallback(() => {
    setClosedBanners([]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [setClosedBanners]);

  return {
    closedBanners,
    setClosedBanners,
    showAnnouncementsToggle,
    onShowAnnouncements,
  };
}
