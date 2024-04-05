import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
} from 'react';
import { connect, useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { get, memoize } from 'lodash';

// @ts-ignore
import betaImage from '@veupathdb/wdk-client/lib/Core/Style/images/beta2-30.png';
// @ts-ignore
import newImage from '@veupathdb/wdk-client/lib/Core/Style/images/new-feature.png';

import makeSnackbarProvider, {
  SnackbarStyleProps,
} from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

import { Loading, Link } from '@veupathdb/wdk-client/lib/Components';
import { ReduxNotificationHandler } from '@veupathdb/wdk-client/lib/Components/Notifications';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { CategoryTreeNode } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { arrayOf, decode, string } from '@veupathdb/wdk-client/lib/Utils/Json';
import { useStudyAccessApi } from '@veupathdb/study-data-access/lib/study-access/studyAccessHooks';

import Announcements from '@veupathdb/web-common/lib/components/Announcements';
import CookieBanner from '@veupathdb/web-common/lib/components/CookieBanner';
import { Footer } from '@veupathdb/web-common/lib/components/homepage/Footer';
import {
  Header,
  HeaderMenuItem,
} from '@veupathdb/web-common/lib/components/homepage/Header';
import { Main } from '@veupathdb/web-common/lib/components/homepage/Main';
import { NewsPane } from '@veupathdb/web-common/lib/components/homepage/NewsPane';
import {
  SearchPane,
  SearchCheckboxTree,
} from '@veupathdb/web-common/lib/components/homepage/SearchPane';
import {
  combineClassNames,
  useAlphabetizedSearchTree,
} from '@veupathdb/web-common/lib/components/homepage/Utils';
import {
  useUserDatasetsWorkspace,
  edaServiceUrl,
} from '@veupathdb/web-common/lib/config';
import { useAnnouncementsState } from '@veupathdb/web-common/lib/hooks/announcements';
import { useCommunitySiteRootUrl } from '@veupathdb/web-common/lib/hooks/staticData';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';
import { formatReleaseDate } from '@veupathdb/web-common/lib/util/formatters';
import { getWdkStudyRecords } from '@veupathdb/eda/lib/core/utils/study-records';

import { PreferredOrganismsSummary } from '@veupathdb/preferred-organisms/lib/components/PreferredOrganismsSummary';

import { Props as PageProps } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { PageDescription } from './PageDescription';
import { makeVpdbClassNameHelper } from './Utils';

import './VEuPathDBHomePage.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import SubsettingClient from '@veupathdb/eda/lib/core/api/SubsettingClient';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Warning } from '@veupathdb/coreui';

const vpdbCx = makeVpdbClassNameHelper('');

type OwnProps = PageProps & {
  isHomePage: boolean;
};

type StateProps = {
  searchTree?: CategoryTreeNode;
  buildNumber?: string;
  releaseDate?: string;
  displayName?: string;
  projectId?: string;
};

type Props = OwnProps & StateProps;

const IS_NEWS_EXPANDED_SESSION_KEY = 'homepage-is-news-expanded';
const SEARCH_TERM_SESSION_KEY = 'homepage-header-search-term';
const EXPANDED_BRANCHES_SESSION_KEY = 'homepage-header-expanded-branch-ids';

const VEuPathDBHomePageView: FunctionComponent<Props> = (props) => {
  return props.isFullScreen ? (
    <VEuPathDBHomePageViewFull {...props} />
  ) : (
    <VEuPathDBHomePageViewStandard {...props} />
  );
};

const VEuPathDBHomePageViewFull: FunctionComponent<Props> = (props) => {
  const cx = makeClassNameHelper('wdk-RootContainer');
  return (
    <VEuPathDBSnackbarProvider styleProps={{ headerExpanded: false }}>
      <ReduxNotificationHandler>
        <div className={cx('', props.classNameModifier)}>{props.children}</div>
      </ReduxNotificationHandler>
    </VEuPathDBSnackbarProvider>
  );
};

const VEuPathDBHomePageViewStandard: FunctionComponent<Props> = (props) => {
  const { isHomePage, classNameModifier } = props;
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [footerThin, setFooterThin] = useState(true);

  const location = useLocation();
  const shouldHideOrgPrefsSubheader =
    location.pathname.includes('workspace/analyses');

  useEffect(() => {
    if (isHomePage && props.displayName) {
      document.title = props.displayName;
    }
  }, [isHomePage, props.displayName]);

  const [isNewsExpanded, setIsNewsExpanded] = useSessionBackedState(
    false,
    IS_NEWS_EXPANDED_SESSION_KEY,
    encodeIsNewsExpanded,
    decodeIsNewsExpanded
  );

  const toggleNews = useCallback(() => {
    setIsNewsExpanded(!isNewsExpanded);
  }, [isNewsExpanded]);

  const [searchTerm, setSearchTerm] = useSessionBackedState(
    '',
    SEARCH_TERM_SESSION_KEY,
    encodeSearchTerm,
    parseSearchTerm
  );

  const [expandedBranches, setExpandedBranches] = useSessionBackedState(
    [],
    EXPANDED_BRANCHES_SESSION_KEY,
    encodeExpandedBranches,
    parseExpandedBranches
  );

  const headerMenuItems = useHeaderMenuItems(
    props.searchTree,
    searchTerm,
    expandedBranches,
    setSearchTerm,
    setExpandedBranches,
    props.projectId,
    props.displayName
  );

  const updateHeaderAndFooter = useCallback(() => {
    setHeaderExpanded(
      document.body.scrollTop <= 60 && document.documentElement.scrollTop <= 60
    );

    // Modern adaptation of https://stackoverflow.com/a/22394544
    const scrollTop =
      document.documentElement?.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement?.scrollHeight || document.body.scrollHeight;
    const scrolledToBottom = scrollTop + window.innerHeight >= scrollHeight;

    setFooterThin(scrollTop === 0 || !scrolledToBottom);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateHeaderAndFooter, { passive: true });
    window.addEventListener('touch', updateHeaderAndFooter, { passive: true });
    window.addEventListener('wheel', updateHeaderAndFooter, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderAndFooter);
      window.removeEventListener('touch', updateHeaderAndFooter);
      window.removeEventListener('wheel', updateHeaderAndFooter);
    };
  }, [updateHeaderAndFooter]);

  useLayoutEffect(() => {
    // FIXME: This is a hack for recalculating the "rabbit ears"
    // of Featured Tools whenever the news is expanded/collapsed
    window.dispatchEvent(new Event('resize'));
  }, [isNewsExpanded]);

  const rootContainerClassName = combineClassNames(
    vpdbCx(
      'RootContainer',
      headerExpanded ? 'header-expanded' : 'header-collapsed',
      isHomePage && 'home',
      isNewsExpanded ? 'news-expanded' : 'news-collapsed',
      classNameModifier
    ),
    props.projectId
  );
  const headerClassName = vpdbCx(
    'Header',
    headerExpanded ? 'expanded' : 'collapsed'
  );
  const subHeaderClassName = vpdbCx(
    'SubHeader',
    headerExpanded ? 'expanded' : 'collapsed'
  );
  const searchPaneClassName = combineClassNames(
    vpdbCx('SearchPane'),
    vpdbCx('BgWash'),
    vpdbCx('BdDark')
  );
  const mainClassName = vpdbCx('Main');
  const newsPaneClassName = combineClassNames(
    vpdbCx('NewsPane', isNewsExpanded ? 'news-expanded' : 'news-collapsed'),
    vpdbCx('BdDark')
  );
  const footerClassName = vpdbCx('Footer', footerThin && 'thin');

  const [closedBanners, setClosedBanners] = useAnnouncementsState();

  const onShowAnnouncements = useCallback(() => {
    setClosedBanners([]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [setClosedBanners]);

  const branding = (
    <>
      <Link to="/">
        <div className={vpdbCx('HeaderBranding')}></div>
      </Link>
      <div className={vpdbCx('HeaderBrandingSuperscript')}>
        {props.buildNumber && <span>Release {props.buildNumber}</span>}
        <br />
        {props.releaseDate && formatReleaseDate(props.releaseDate)}
      </div>
    </>
  );

  const snackbarStyleProps = useMemo(
    () => ({ headerExpanded }),
    [headerExpanded]
  );

  return (
    <VEuPathDBSnackbarProvider styleProps={snackbarStyleProps}>
      <ReduxNotificationHandler>
        <div className={rootContainerClassName}>
          <ErrorBoundary>
            <Header
              menuItems={headerMenuItems}
              containerClassName={headerClassName}
              onShowAnnouncements={onShowAnnouncements}
              showAnnouncementsToggle={isHomePage && closedBanners.length > 0}
              branding={branding}
            />
          </ErrorBoundary>
          {!shouldHideOrgPrefsSubheader && (
            <div className={subHeaderClassName}>
              <PreferredOrganismsSummary />
            </div>
          )}
          <div className={vpdbCx('Announcements')}>
            <Announcements
              closedBanners={closedBanners}
              setClosedBanners={setClosedBanners}
            />
          </div>
          {isHomePage && (
            <ErrorBoundary>
              <SearchPane
                containerClassName={searchPaneClassName}
                searchTree={props.searchTree}
              />
            </ErrorBoundary>
          )}
          <Main containerClassName={mainClassName}>{props.children}</Main>
          {isHomePage && (
            <ErrorBoundary>
              <NewsPane
                containerClassName={newsPaneClassName}
                isNewsExpanded={isNewsExpanded}
                toggleNews={toggleNews}
              />
            </ErrorBoundary>
          )}
          <ErrorBoundary>
            <Footer containerClassName={footerClassName}>
              <PageDescription />
            </Footer>
          </ErrorBoundary>
          <ErrorBoundary>
            <CookieBanner />
          </ErrorBoundary>
        </div>
      </ReduxNotificationHandler>
    </VEuPathDBSnackbarProvider>
  );
};

const encodeIsNewsExpanded = (b: boolean) => (b ? 'y' : '');
const decodeIsNewsExpanded = (s: string) => !!s;

const encodeSearchTerm = (s: string) => s;
const parseSearchTerm = encodeSearchTerm;

const encodeExpandedBranches = JSON.stringify;
const parseExpandedBranches = memoize((s: string) =>
  decode(arrayOf(string), s)
);

const AmoebaDB = 'AmoebaDB';
const CryptoDB = 'CryptoDB';
const EuPathDB = 'EuPathDB';
const FungiDB = 'FungiDB';
const GiardiaDB = 'GiardiaDB';
const HostDB = 'HostDB';
const MicrosporidiaDB = 'MicrosporidiaDB';
const PiroplasmaDB = 'PiroplasmaDB';
const PlasmoDB = 'PlasmoDB';
const ToxoDB = 'ToxoDB';
const TrichDB = 'TrichDB';
const TriTrypDB = 'TriTrypDB';
const VectorBase = 'VectorBase';
const VEuPathDB = 'VEuPathDB';
const UniDB = 'UniDB';
const DB = 'DB';

const QUESTION_FOR_MAP_DATASETS = 'MapStudiesForToolbar';

function makeStaticPageRoute(subPath: string) {
  return `${STATIC_ROUTE_PATH}${subPath}`;
}

function makeExternalStaticPageUrl(
  communitySiteUrl: string | undefined,
  subPath: string
) {
  return `https://${communitySiteUrl}${subPath}`;
}

type HeaderMenuItemEntry = HeaderMenuItem<{
  include?: string[];
  exclude?: string[];
  test?: () => boolean;
}>;

const useHeaderMenuItems = (
  searchTree: CategoryTreeNode | undefined,
  searchTerm: string,
  expandedBranches: string[],
  setSearchTerm: (newSearchTerm: string) => void,
  setExpandedBranches: (newExpandedBranches: string[]) => void,
  projectId: string | undefined,
  displayName: string | undefined
): HeaderMenuItem[] => {
  const alphabetizedSearchTree = useAlphabetizedSearchTree(searchTree);
  const communitySite = useCommunitySiteRootUrl();

  const mapMenuItemsQuestion = useSelector((state: RootState) =>
    state.globalData.questions?.find(
      (q) => q.urlSegment === QUESTION_FOR_MAP_DATASETS
    )
  );
  const showInteractiveMaps = mapMenuItemsQuestion != null;
  const mapMenuItems = useMapMenuItems(mapMenuItemsQuestion);

  // type: reactRoute, webAppRoute, externalLink, subMenu, custom
  const fullMenuItemEntries: HeaderMenuItemEntry[] = [
    {
      key: 'search-strategies',
      display: 'My Strategies',
      type: 'reactRoute',
      url: '/workspace/strategies',
    },
    {
      key: 'searchContainer',
      display: 'Searches',
      type: 'subMenu',
      items: [
        {
          key: 'searches',
          display: (
            <SearchCheckboxTree
              searchTree={alphabetizedSearchTree}
              searchTerm={searchTerm}
              expandedBranches={expandedBranches}
              setSearchTerm={setSearchTerm}
              setExpandedBranches={setExpandedBranches}
              type="headerMenu"
            />
          ),
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
          key: 'apollo',
          display: 'Apollo',
          tooltip: 'Instantaneous, collaborative, genome annotation editor',
          type: 'reactRoute',
          url: makeStaticPageRoute(`/apollo_help.html`),
          metadata: {
            include: [
              AmoebaDB,
              CryptoDB,
              FungiDB,
              GiardiaDB,
              MicrosporidiaDB,
              PiroplasmaDB,
              PlasmoDB,
              ToxoDB,
              TrichDB,
              TriTrypDB,
              VectorBase,
              EuPathDB,
              VEuPathDB,
              UniDB,
            ],
          },
        },
        {
          key: 'blast',
          display: 'BLAST (multi-query capable)',
          type: 'reactRoute',
          url: '/workspace/blast/new',
        },
        {
          key: 'companion',
          display: 'Companion',
          type: 'externalLink',
          tooltip:
            'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'https://companion.ac.uk/',
          metadata: {
            exclude: [VectorBase],
          },
        },
        {
          key: 'EuPaGDT',
          display: 'CRISPR guide design tool',
          type: 'externalLink',
          tooltip:
            'CRISPR GuideXpress at DRSC/TRiP Functional Genomics Resources',
          url: 'https://www.flyrnai.org/tools/fly2mosquito/web/',
          metadata: {
            include: [VectorBase],
          },
        },
        {
          key: 'EuPaGDT',
          display: 'CRISPR guide design tool',
          type: 'externalLink',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'http://grna.ctegd.uga.edu',
          metadata: {
            exclude: [VectorBase],
          },
        },
        {
          key: 'user-provided-links',
          display: 'External tools & resources',
          tooltip: 'User-provided resources',
          type: 'reactRoute',
          url: makeStaticPageRoute(
            '/VectorBase/externalLinks.html#external-resources'
          ),
          metadata: {
            include: [VectorBase],
          },
        },
        {
          key: 'galaxy',
          display: 'Galaxy',
          type: 'reactRoute',
          url: '/galaxy-orientation',
        },
        {
          key: 'jbrowse',
          display: 'Genome browser',
          type: 'reactRoute',
          url: '/jbrowse?data=/a/service/jbrowse/tracks/default',
          metadata: {
            exclude: [EuPathDB],
          },
        },
        {
          key: 'vb-images',
          display: 'Image gallery',
          tooltip: 'Free to use pictures of vectors',
          type: 'reactRoute',
          url: makeStaticPageRoute('/VectorBase/imageGallery.html'),
          metadata: {
            include: [VectorBase],
          },
        },
        {
          key: 'LeishGEdit',
          display: 'LeishGEdit',
          tooltip:
            'Your online resource for CRISPR Cas9 T7 RNA Polymerase gene editing in kinetoplastids',
          type: 'externalLink',
          url: 'http://www.leishgedit.net',
          metadata: {
            include: [TriTrypDB],
          },
        },
        !showInteractiveMaps
          ? {
              type: 'custom',
              key: 'maps-alpha',
              display: null,
              metadata: {
                test: () => showInteractiveMaps,
              },
            }
          : mapMenuItems == null
          ? {
              key: 'maps-alpha',
              type: 'custom',
              display: (
                <>
                  MapVEu &mdash; Interactive maps{' '}
                  <img alt="NEW" src={newImage} />{' '}
                  <Loading
                    style={{
                      display: 'inline-block',
                      height: '1em',
                      width: '1em',
                      padding: 0,
                    }}
                    radius={1}
                  />
                </>
              ),
            }
          : mapMenuItems.length === 1
          ? {
              ...mapMenuItems[0],
              display: (
                <>
                  MapVEu &mdash; {mapMenuItems[0].display}{' '}
                  <img alt="NEW" src={newImage} />
                </>
              ),
            }
          : {
              key: 'maps-alpha',
              type: 'subMenu',
              display: (
                <>
                  MapVEu &mdash; Interactive maps{' '}
                  <img alt="NEW" src={newImage} />
                </>
              ),
              items: mapMenuItems,
            },
        {
          key: 'ncbi-primer3',
          display: 'NCBI Primer3',
          type: 'externalLink',
          url: 'https://www.ncbi.nlm.nih.gov/tools/primer-blast/',
        },
        {
          key: 'plasmoap',
          display: 'PlasmoAP',
          type: 'reactRoute',
          url: '/plasmoap',
          metadata: {
            include: [PlasmoDB],
          },
        },
        /*  {
          key: 'pats',
          display: 'PATS',
          type: 'externalLink',
          url: 'http://modlabcadd.ethz.ch/software/pats/',
          metadata: {
            include: [ PlasmoDB ]
          }
        },*/
        {
          key: 'pubcrawler',
          display: 'PubMed and Entrez',
          type: 'externalLink',
          url: `/pubcrawler/${displayName}`,
        },
        {
          key: 'srt',
          display: (
            <>
              Sequence retrieval{' '}
              {projectId === EuPathDB ? '' : <img alt="NEW" src={newImage} />}
            </>
          ),
          type: 'reactRoute',
          url: '/fasta-tool',
        },
        {
          key: 'study-explorer',
          display: (
            <>
              WGCNA Study explorer <img alt="NEW" src={newImage} />
            </>
          ),
          type: 'reactRoute',
          url: '/workspace/analyses/DS_82dc5abc7f/new',
          metadata: {
            include: [PlasmoDB, HostDB, EuPathDB, UniDB],
          },
        },
        {
          key: 'webservices',
          display: 'Web services',
          type: 'reactRoute',
          url: makeStaticPageRoute(`/content/${displayName}/webServices.html`),
        },
      ],
    },
    {
      key: 'workspace',
      display: 'My Workspace',
      type: 'subMenu',
      items: [
        {
          key: 'galaxy-analyses',
          display: 'Analyze my data (Galaxy)',
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
          key: 'blasta',
          display: 'My BLAST jobs',
          type: 'reactRoute',
          url: '/workspace/blast/all',
        },
        {
          key: 'user-data-sets',
          display: 'My data sets',
          type: 'reactRoute',
          url: '/workspace/datasets',
          metadata: {
            exclude: [EuPathDB],
            test: () => Boolean(useUserDatasetsWorkspace),
          },
        },
        {
          key: 'favorites',
          display: 'My favorites',
          type: 'reactRoute',
          url: '/workspace/favorites',
          metadata: {
            exclude: [EuPathDB],
          },
        },
        {
          key: 'maps-workspace',
          display: 'My interactive maps',
          type: 'reactRoute',
          url: '/workspace/maps',
          metadata: {
            test: () => Boolean(showInteractiveMaps),
          },
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
          key: 'methods',
          display: 'Analysis methods',
          type: 'reactRoute',
          tooltip: 'How we obtain/generate the data',
          url: makeStaticPageRoute(`/methods.html`),
        },
        {
          key: 'datasets',
          display: `Data sets in ${displayName}`,
          type: 'reactRoute',
          url: '/search/dataset/AllDatasets/result',
        },
        {
          key: 'datasets-in-progress2',
          display: 'Data sets we are working on',
          type: 'reactRoute',
          url: makeStaticPageRoute('/dataInprogress.html'),
        },
        {
          key: 'data-files-eupathdb-beta',
          display: <>Download data files</>,
          type: 'reactRoute',
          url: '/downloads',
        },
        {
          key: 'mahpic-data',
          display: 'MaHPIC',
          type: 'reactRoute',
          tooltip: 'Access MaHPIC Data',
          url: makeStaticPageRoute(`/${projectId}/mahpic.html`),
          metadata: {
            include: [PlasmoDB],
          },
        },
        {
          key: 'genomes-and-data-types',
          display: 'Organisms: Genome Info & Stats',
          tooltip: `Table summarizing all the genomes in ${displayName}`,
          type: 'reactRoute',
          url: '/search/organism/GenomeDataTypes/result',
        },
        {
          key: 'community-download',
          display: 'User uploaded files',
          type: 'reactRoute',
          url: '/search/file/UserFileUploads?autoRun=1',
          metadata: {
            exclude: [EuPathDB],
          },
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
          display: `What is ${displayName}?`,
          type: 'reactRoute',
          url: makeStaticPageRoute('/about.html'),
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
            },
            {
              key: 'amoebadb',
              display: 'AmoebaDB',
              type: 'externalLink',
              url: 'https://amoebadb.org',
            },
            {
              key: 'cryptodb',
              display: 'CryptoDB',
              type: 'externalLink',
              url: 'https://cryptodb.org',
            },
            {
              key: 'fungidb',
              display: 'FungiDB',
              type: 'externalLink',
              url: 'https://fungidb.org',
            },
            {
              key: 'giardiadb',
              display: 'GiardiaDB',
              type: 'externalLink',
              url: 'https://giardiadb.org',
            },
            {
              key: 'hostdb',
              display: 'HostDB',
              type: 'externalLink',
              url: 'https://hostdb.org',
            },
            {
              key: 'microsporidiadb',
              display: 'MicrosporidiaDB',
              type: 'externalLink',
              url: 'https://microsporidiadb.org',
            },
            {
              key: 'piroplasmadb',
              display: 'PiroplasmaDB',
              type: 'externalLink',
              url: 'https://piroplasmadb.org',
            },
            {
              key: 'plasmodb',
              display: 'PlasmoDB',
              type: 'externalLink',
              url: 'https://plasmodb.org',
            },
            {
              key: 'toxodb',
              display: 'ToxoDB',
              type: 'externalLink',
              url: 'https://toxodb.org',
            },
            {
              key: 'trichdb',
              display: 'TrichDB',
              type: 'externalLink',
              url: 'https://trichdb.org',
            },
            {
              key: 'tritrypdb',
              display: 'TriTrypDB',
              type: 'externalLink',
              url: 'https://tritrypdb.org',
            },
            {
              key: 'vectorbase',
              display: 'VectorBase',
              type: 'externalLink',
              url: 'https://vectorbase.org',
            },
            {
              key: 'orthomcl',
              display: 'OrthoMCL',
              type: 'externalLink',
              url: 'https://orthomcl.org',
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
              display: 'Public search strategies',
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
            },
          ],
        },
        {
          key: 'submitting',
          type: 'subMenu',
          display: 'Submit data',
          items: [
            {
              key: 'submission-instructions',
              display: 'How to submit data to us',
              type: 'reactRoute',
              url: makeStaticPageRoute('/dataSubmission.html'),
            },
            {
              key: 'datasets-in-progress',
              display: 'Data Sets we are working on',
              type: 'reactRoute',
              url: makeStaticPageRoute('/dataInprogress.html'),
            },
            {
              key: 'submission-policy',
              display: 'Data submission and release policies',
              type: 'reactRoute',
              url: makeStaticPageRoute('/dataSubmissionReleasePolicy.html'),
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
              key: 'methods',
              display: 'Analysis methods',
              type: 'reactRoute',
              tooltip: 'How we obtain/generate the data',
              url: makeStaticPageRoute(`/methods.html`),
            },
            {
              key: 'infrastructure',
              display: 'Infrastructure',
              type: 'reactRoute',
              url: makeStaticPageRoute('/infrastructure.html'),
            },
            {
              key: 'usage-metrics',
              display: 'Monthly Usage Metrics',
              type: 'externalLink',
              url: '/reports/VEuPathDB_BRC4_usage_metrics_report.pdf',
            },
            {
              key: 'perf-metrics',
              display: 'Monthly Performance Metrics',
              type: 'externalLink',
              url: '/reports/VEuPathDB_BRC4_performance_metrics_report.pdf',
            },
            {
              key: 'usage-statistics',
              display: 'Website usage statistics',
              type: 'externalLink',
              url: '/awstats/awstats.pl',
              metadata: {
                exclude: [EuPathDB],
              },
            },
            {
              key: 'usage-statistics-portal',
              display: 'All websites usage statistics',
              type: 'externalLink',
              url: '/awstats/awstats.pl?config=All_EBRC_Combined',
              metadata: {
                include: [EuPathDB],
              },
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
          key: 'learning',
          display: 'Learn how to use VEuPathDB',
          type: 'subMenu',
          items: [
            {
              key: 'faqs',
              display: 'FAQs',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/faq.html`),
            },
            {
              key: 'webinars',
              display: 'Webinars',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/webinars.html`),
            },
            {
              key: 'workshops',
              display: 'Workshops',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/workshops.html`),
            },
            {
              key: 'tutorials',
              display: 'Tutorials',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/tutorials.html`),
            },
            {
              key: 'videos',
              display: 'Videos',
              type: 'externalLink',
              url: 'https://www.youtube.com/user/EuPathDB/playlists',
            },
            {
              key: 'methods',
              display: 'Analysis methods',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/methods.html`),
            },
            {
              key: 'landing',
              display: 'All learning resources',
              type: 'reactRoute',
              url: makeStaticPageRoute('/landing.html'),
            },
          ],
        },

        {
          key: 'our-glossary',
          display: `VEuPathDB glossary`,
          type: 'reactRoute',
          url: makeStaticPageRoute('/glossary.html'),
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
      target: '_blank',
      url: '/contact-us',
    },
  ];

  // Don't render submenus until projectId and displayName have loaded
  const menuItemEntries: HeaderMenuItemEntry[] = fullMenuItemEntries.map(
    (menuItemEntry) =>
      menuItemEntry.type !== 'subMenu' ||
      (projectId != null && displayName != null)
        ? menuItemEntry
        : {
            ...menuItemEntry,
            items: [
              {
                key: `${menuItemEntry.key}-loading`,
                display: <Loading />,
                type: 'custom',
              },
            ],
          }
  );

  return menuItemEntries.flatMap((menuItemEntry) =>
    filterMenuItemEntry(menuItemEntry, projectId)
  );
};

const filterMenuItemEntry = (
  menuItemEntry: HeaderMenuItemEntry,
  projectId: string | undefined
): HeaderMenuItemEntry[] =>
  menuItemEntry.metadata &&
  ((projectId != null &&
    menuItemEntry.metadata.include &&
    !menuItemEntry.metadata.include.includes(projectId)) ||
    (projectId != null &&
      menuItemEntry.metadata.exclude &&
      menuItemEntry.metadata.exclude.includes(projectId)) ||
    menuItemEntry.metadata.test?.() === false)
    ? []
    : menuItemEntry.type !== 'subMenu'
    ? [menuItemEntry]
    : [
        {
          ...menuItemEntry,
          items: menuItemEntry.items.flatMap((menuItemEntry) =>
            filterMenuItemEntry(menuItemEntry, projectId)
          ),
        },
      ];

// FIXME: Use a hook instead of "connect" to provide the global data
const mapStateToProps = (state: RootState) => ({
  // FIXME: This is not typesafe.
  searchTree: get(state.globalData, 'searchTree') as CategoryTreeNode,
  buildNumber: state.globalData.config?.buildNumber,
  releaseDate: state.globalData.config?.releaseDate,
  displayName: state.globalData.config?.displayName,
  projectId: state.globalData.siteConfig?.projectId,
});

function translateNotificationsOnTop({
  headerExpanded,
}: SnackbarStyleProps<{ headerExpanded: boolean }>) {
  return {
    transform: headerExpanded ? 'translateY(149px)' : 'translateY(84px)',
  };
}

const VEuPathDBSnackbarProvider = makeSnackbarProvider(
  {
    containerRoot: {
      zIndex: 99,
    },
    anchorOriginTopLeft: translateNotificationsOnTop,
    anchorOriginTopCenter: translateNotificationsOnTop,
    anchorOriginTopRight: translateNotificationsOnTop,
  },
  'VEuPathDBSnackbarProvider'
);

export const VEuPathDBHomePage = connect(mapStateToProps)(
  VEuPathDBHomePageView
);

function useMapMenuItems(question?: Question) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const studyAccessApi = useStudyAccessApi_tryCatch();
  const subsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: edaServiceUrl }, wdkService),
    [wdkService]
  );
  const [mapMenuItems, setMapMenuItems] = useState<HeaderMenuItemEntry[]>();
  useEffect(() => {
    if (question == null || studyAccessApi == null) return;
    getWdkStudyRecords(
      { studyAccessApi, subsettingClient, wdkService },
      { searchName: question.urlSegment }
    ).then(
      (records) => {
        const menuItems = records.map(
          (record): HeaderMenuItemEntry => ({
            key: `map-${record.id[0].value}`,
            display: record.displayName,
            type: 'reactRoute',
            url: `/workspace/maps/${record.id[0].value}/new`,
          })
        );
        setMapMenuItems(menuItems);
      },
      (error) => {
        console.error(error);
        setMapMenuItems([
          {
            key: 'map-error',
            type: 'custom',
            display: (
              <>
                <Warning /> Unable to load map datasets.
              </>
            ),
          },
        ]);
      }
    );
  }, [question, studyAccessApi, subsettingClient, wdkService]);
  return mapMenuItems;
}

function useStudyAccessApi_tryCatch() {
  // useStudyAccessApi() will throw if WdkService isn't configured for study
  // access. We can ignore the error and return `undefined` to allow the
  // application to handle the absence of the configuration.
  try {
    return useStudyAccessApi();
  } catch {
    return;
  }
}
