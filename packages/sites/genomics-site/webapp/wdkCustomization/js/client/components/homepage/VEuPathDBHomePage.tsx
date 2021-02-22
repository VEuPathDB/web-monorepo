import React, { FunctionComponent, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { connect } from 'react-redux';

import { get, memoize } from 'lodash';

import { Loading, Link } from '@veupathdb/wdk-client/lib/Components';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { CategoryTreeNode } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { arrayOf, decode, string } from '@veupathdb/wdk-client/lib/Utils/Json';

import Announcements from '@veupathdb/web-common/lib/components/Announcements';
import CookieBanner from '@veupathdb/web-common/lib/components/CookieBanner';
import { Footer } from '@veupathdb/web-common/lib/components/homepage/Footer';
import { Header, HeaderMenuItem } from '@veupathdb/web-common/lib/components/homepage/Header';
import { Main } from '@veupathdb/web-common/lib/components/homepage/Main';
import { NewsPane } from '@veupathdb/web-common/lib/components/homepage/NewsPane';
import { SearchPane, SearchCheckboxTree } from '@veupathdb/web-common/lib/components/homepage/SearchPane';
import { combineClassNames, useAlphabetizedSearchTree } from '@veupathdb/web-common/lib/components/homepage/Utils';
import { useAnnouncementsState } from '@veupathdb/web-common/lib/hooks/announcements';

import { useCommunitySiteRootUrl } from '@veupathdb/web-common/lib/hooks/staticData';

import { formatReleaseDate } from '@veupathdb/web-common/lib/util/formatters';

import { PageDescription } from './PageDescription';
import { makeVpdbClassNameHelper } from './Utils';

import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';

import './VEuPathDBHomePage.scss';

const vpdbCx = makeVpdbClassNameHelper('');

type OwnProps = {
  isHomePage: boolean;
  classNameModifier?: string;
}

type StateProps = {
  searchTree?: CategoryTreeNode,
  buildNumber?: string,
  releaseDate?: string,
  displayName?: string,
  projectId?: string
}

type Props = OwnProps & StateProps;

const IS_NEWS_EXPANDED_SESSION_KEY = 'homepage-is-news-expanded';
const SEARCH_TERM_SESSION_KEY = 'homepage-header-search-term';
const EXPANDED_BRANCHES_SESSION_KEY = 'homepage-header-expanded-branch-ids';

const VEuPathDBHomePageView: FunctionComponent<Props> = props => {
  const { isHomePage, classNameModifier } = props;
  const [ headerExpanded, setHeaderExpanded ] = useState(true);
  const [ footerThin, setFooterThin ] = useState(true);

  useEffect(() => {
    if (isHomePage && props.displayName) {
      document.title = props.displayName;
    }
  }, [ isHomePage, props.displayName ]);

  const [ isNewsExpanded, setIsNewsExpanded ] = useSessionBackedState(
    false,
    IS_NEWS_EXPANDED_SESSION_KEY,
    encodeIsNewsExpanded,
    decodeIsNewsExpanded
  );

  const toggleNews = useCallback(() => {
    setIsNewsExpanded(!isNewsExpanded);
  }, [ isNewsExpanded ]);

  const [ searchTerm, setSearchTerm ] = useSessionBackedState(
    '', 
    SEARCH_TERM_SESSION_KEY, 
    encodeSearchTerm, 
    parseSearchTerm
  );

  const [ expandedBranches, setExpandedBranches ] = useSessionBackedState(
    [ ], 
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
    setHeaderExpanded(document.body.scrollTop <= 80 && document.documentElement.scrollTop <= 80);

    // Modern adaptation of https://stackoverflow.com/a/22394544
    const scrollTop = document.documentElement?.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement?.scrollHeight || document.body.scrollHeight;
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
  }, [ updateHeaderAndFooter ]);

  useLayoutEffect(() => {
    // FIXME: This is a hack for recalculating the "rabbit ears"
    // of Featured Tools whenever the news is expanded/collapsed
    window.dispatchEvent(new Event('resize'));
  }, [ isNewsExpanded ]);

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
  const headerClassName = vpdbCx('Header', headerExpanded ? 'expanded' : 'collapsed');
  const searchPaneClassName = combineClassNames(vpdbCx('SearchPane'), vpdbCx('BgWash'), vpdbCx('BdDark'));
  const mainClassName = vpdbCx('Main');
  const newsPaneClassName = combineClassNames(
    vpdbCx('NewsPane', isNewsExpanded ? 'news-expanded' : 'news-collapsed'),
    vpdbCx('BdDark')
  );
  const footerClassName = vpdbCx('Footer', footerThin && 'thin');

  const [ closedBanners, setClosedBanners ] = useAnnouncementsState();

  const onShowAnnouncements = useCallback(() => {
    setClosedBanners([]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [ setClosedBanners ]);

  const branding = (
    <>
      <Link to="/">
        <div className={vpdbCx('HeaderBranding')}>
        </div>
      </Link>
      <div className={vpdbCx('HeaderBrandingSuperscript')}>
        {props.buildNumber && <span>Release {props.buildNumber} <em>beta</em></span>}
        <br />
        {props.releaseDate && formatReleaseDate(props.releaseDate)}
      </div>
    </>
  );

  return (
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
      <div className={vpdbCx('Announcements')}>
        <Announcements
          closedBanners={closedBanners}
          setClosedBanners={setClosedBanners}
        />
      </div>
      {isHomePage &&
        <ErrorBoundary>
          <SearchPane 
            containerClassName={searchPaneClassName} 
            searchTree={props.searchTree}
          />
        </ErrorBoundary>
      }
      <Main containerClassName={mainClassName}>
        {props.children}
      </Main>
      {isHomePage && 
        <ErrorBoundary>
          <NewsPane containerClassName={newsPaneClassName} isNewsExpanded={isNewsExpanded} toggleNews={toggleNews} />
        </ErrorBoundary>
      }
      <ErrorBoundary>
        <Footer containerClassName={footerClassName}>
          <PageDescription />
        </Footer>
      </ErrorBoundary>
      <ErrorBoundary>
        <CookieBanner/>
      </ErrorBoundary>
    </div>
  );
}

const encodeIsNewsExpanded = (b: boolean) => b ? 'y' : '';
const decodeIsNewsExpanded = (s: string) => !!s;

const encodeSearchTerm = (s: string) => s;
const parseSearchTerm = encodeSearchTerm;

const encodeExpandedBranches = JSON.stringify;
const parseExpandedBranches = memoize((s: string) => decode(
  arrayOf(string),
  s
));

const AmoebaDB = 'AmoebaDB';
const CryptpDB = 'CryptoDB';
const EuPathDB = 'EuPathDB';
const FungiDB  = 'FungiDB';
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
const DB = 'DB';



function makeStaticPageRoute(subPath: string) {
  return `${STATIC_ROUTE_PATH}${subPath}`;
}

function makeExternalStaticPageUrl(communitySiteUrl: string | undefined, subPath: string) {
  return `https://${communitySiteUrl}${subPath}`;
}

type HeaderMenuItemEntry = HeaderMenuItem<{
  include?: string[],
  exclude?: string[]
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

  // type: reactRoute, webAppRoute, externalLink, subMenu, custom
  const fullMenuItemEntries: HeaderMenuItemEntry[] = [
    {
      key: 'search-strategies',
      display: 'My Strategies',
      type: 'reactRoute',
      url: '/workspace/strategies'
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
            />
          ),
          type: 'custom'
        }
      ]
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
            include: [ AmoebaDB,PiroplasmaDB,ToxoDB,VectorBase ]
         }
        },
        {
          key: 'blast-beta',
          display: <>BLAST<sup>{' '}<em>beta</em></sup></>,
          type: 'reactRoute',
          url: '/workspace/blast/new'
        },
        {
          key: 'blast',
          display: 'BLAST',
          type: 'reactRoute',
          url: '/search/transcript/UnifiedBlast'
        },
        { 
          key: 'companion',
          display: 'Companion',
          type: 'externalLink',
          tooltip: 'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'http://companion.gla.ac.uk/',
          target: '_blank',
          metadata: {
            exclude: [ FungiDB,VectorBase ]
          }
        },
        { 
          key: 'companion--fungi',
          display: 'Companion Fungi',
          type: 'externalLink',
          tooltip: 'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'http://fungicompanion.gla.ac.uk/',
          target: '_blank',
          metadata: {
            include: [ FungiDB ]
          }
        },
        {
          key: 'EuPaGDT',
          display: 'EuPaGDT',
          type: 'externalLink',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'https://www.flyrnai.org/tools/fly2mosquito/web/',
          target: '_blank',
          metadata: {
            include: [ VectorBase ]
          }
        },
        {
          key: 'EuPaGDT',
          display: 'EuPaGDT',
          type: 'externalLink',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'http://grna.ctegd.uga.edu',
          target: '_blank',
          metadata: {
            exclude: [ VectorBase ]
          }
        },
        { 
          key: 'user-provided-links',
          display: 'External tools & resources',
          tooltip: 'User-provided resources',
          type: 'reactRoute',
          url: makeStaticPageRoute('/VectorBase/externalLinks.html#external-resources'),
          metadata: {
            include: [ VectorBase ]
          }
        },
        { 
          key: 'galaxy',
          display: 'Galaxy',
          type: 'reactRoute',
          url: '/galaxy-orientation'
        },
        { 
          key: 'jbrowse',
          display: 'Genome browser',
          type: 'reactRoute',
          url: '/jbrowse?data=/a/service/jbrowse/tracks/default',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        { 
          key: 'ancillary-genome-browser',
          display: 'Ancillary genome browser',
          type: 'externalLink',
          url: 'http://ancillary.toxodb.org',
          target: '_blank',
          metadata: {
            include: [ ToxoDB ]
          }
        },
        {
          key: 'vb-images',
          display: 'Image gallery',
          tooltip: 'Free to use pictures of vectors',
          type: 'reactRoute',
          url: makeStaticPageRoute('/VectorBase/imageGallery.html'),
          metadata: {
            include: [ VectorBase ]
          }
        },
        {
          key: 'LeishGEdit',
          display: 'LeishGEdit',
          tooltip: 'Your online resource for CRISPR Cas9 T7 RNA Polymerase gene editing in kinetoplastids',
          type: 'externalLink',
          url: 'http://www.leishgedit.net',
          target: '_blank',
          metadata: {
            include: [ TriTrypDB ]
          }
        },
        {
          key: 'plasmoap',
          display: 'PlasmoAP',
          type: 'reactRoute',
          url: '/plasmoap',
          metadata: {
            include: [ PlasmoDB ]
          }
        },
      /*  {
          key: 'pats',
          display: 'PATS',
          type: 'externalLink',
          url: 'http://modlabcadd.ethz.ch/software/pats/',
          target: '_blank',
          metadata: {
            include: [ PlasmoDB ]
          }
        },*/
        { 
          key: 'mapveu',
          display: 'MapVEu',
          tooltip: 'Population Biology map',
          type: 'externalLink',
          url: '/popbio-map/web/',
          target: '_blank',
          metadata: {
            include: [ VectorBase ]
         }
        },
        {
          key: 'pubcrawler',
          display: 'PubMed and Entrez',
          type: 'externalLink',
          url: `/pubcrawler/${projectId}`,
          target: '_blank'
        },
        { 
          key: 'srt',
          display: 'Sequence retrieval',
          type: 'reactRoute',
          url: '/fasta-tool'
        },
        {
          key: 'webservices',
          display: 'Web services',
          type: 'reactRoute',
          url: makeStaticPageRoute(`/content/${displayName}/webServices.html`)
        }
      ]
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
          url: '/galaxy-orientation'
        },
        {
          key: 'basket',
          display: 'My baskets',
          type: 'reactRoute',
          url: '/workspace/basket'
        },
        { 
          key: 'user-data-sets',
          display: 'My data sets',
          type: 'reactRoute',
          url: '/workspace/datasets',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        {   
          key: 'favorites',
          display: 'My favorites',
          type: 'reactRoute',
          url: '/workspace/favorites',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        {
              key: 'public-strategies',
              display: 'Public search strategies',
              type: 'reactRoute',
              url: '/workspace/strategies/public'
        }
      ]
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
          url: makeStaticPageRoute(`/methods.html`)
        },
        {
          key: 'datasets',
          display: `Data sets in ${displayName}`,
          type: 'reactRoute',
          url: '/search/dataset/AllDatasets/result'
        },
        {
          key: 'data-files-eupathdb',
          display: 'Download data files',
          type: 'reactRoute',
          url: '/downloads/',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        { 
          key: 'mahpic-data',
          display: 'MaHPIC',
          type: 'reactRoute',
          tooltip: 'Access MaHPIC Data',
          url: makeStaticPageRoute(`/${projectId}/mahpic.html`),
          metadata: {
            include: [ PlasmoDB ]
          }
        },
        { 
          key: 'genomes-and-data-types',
          display: 'Organisms: Genome Info & Stats',
          tooltip: `Table summarizing all the genomes in ${displayName}`,
          type: 'reactRoute',
          url: '/search/organism/GenomeDataTypes/result'
        },
        {
          key: 'community-download',
          display: 'User uploaded files',
          type: 'reactRoute',
          url: '/search/file/UserFileUploads?autoRun=1',
          metadata: {
            exclude: [ EuPathDB ]
          }
        }
      ]
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
          url: makeStaticPageRoute('/about.html')
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
              target: '_blank'
            },
            { 
              key: 'amoebadb',
              display: 'AmoebaDB',
              type: 'externalLink',
              url: 'https://amoebadb.org',
              target: '_blank'
            },
            {
              key: 'cryptodb',
              display: 'CryptoDB',
              type: 'externalLink',
              url: 'https://cryptodb.org',
              target: '_blank'
            },
            {
              key: 'fungidb',
              display: 'FungiDB',
              type: 'externalLink',
              url: 'https://fungidb.org',
              target: '_blank'
            },
            {
              key: 'giardiadb',
              display: 'GiardiaDB',
              type: 'externalLink',
              url: 'https://giardiadb.org',
              target: '_blank'
            },
            {
              key: 'hostdb',
              display: 'HostDB',
              type: 'externalLink',
              url: 'https://hostdb.org',
              target: '_blank'
            },
            {
              key: 'microsporidiadb',
              display: 'MicrosporidiaDB',
              type: 'externalLink',
              url: 'https://microsporidiadb.org',
              target: '_blank'
            },
            {
              key: 'piroplasmadb',
              display: 'PiroplasmaDB',
              type: 'externalLink',
              url: 'https://piroplasmadb.org',
              target: '_blank'
            },
            {
              key: 'plasmodb',
              display: 'PlasmoDB',
              type: 'externalLink',
              url: 'https://plasmodb.org',
              target: '_blank'
            },
            {
              key: 'toxodb',
              display: 'ToxoDB',
              type: 'externalLink',
              url: 'https://toxodb.org',
              target: '_blank'
            },
            {
              key: 'trichdb',
              display: 'TrichDB',
              type: 'externalLink',
              url: 'https://trichdb.org',
              target: '_blank'
            },
            {
              key: 'tritrypdb',
              display: 'TriTrypDB',
              type: 'externalLink',
              url: 'https://tritrypdb.org',
              target: '_blank'
            },
            {
              key: 'vectorbase',
              display: 'VectorBase',
              type: 'externalLink',
              url: 'https://vectorbase.org',
              target: '_blank'
            },
            {
              key: 'orthomcl',
              display: 'OrthoMCL',
              type: 'externalLink',
              url: 'https://orthomcl.org',
              target: '_blank'
            }
          ]
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
              url: makeStaticPageRoute(`/${displayName}/news.html`)
            },
            { 
              key: 'public-strategies',
              display: 'Public search strategies',
              type: 'reactRoute',
              url: '/workspace/strategies/public'
            },
            { 
              key: 'related-sites',
              display: 'Related sites',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/${displayName}/externalLinks.html`)
            }
          ]
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
              url: makeStaticPageRoute('/veupathPubs.html')
            },
            {
              key: 'citations',
              display: 'Publications that use our resources',
              type: 'externalLink',
              url: 'https://scholar.google.com/scholar?hl=en&as_sdt=0,39&q=OrthoMCL+OR+PlasmoDB+OR+ToxoDB+OR+CryptoDB+OR+TrichDB+OR+GiardiaDB+OR+TriTrypDB+OR+AmoebaDB+OR+MicrosporidiaDB+OR+%22FungiDB%22+OR+PiroplasmaDB+OR+%22vectorbase%22+OR+veupathdb+OR+ApiDB+OR+EuPathDB+-encrypt+-cryptography+-hymenoptera&scisbd=1',
              target: '_blank'
            }
          ]
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
              url: makeStaticPageRoute('/dataSubmission.html')
            },
            {
              key: 'submission-policy',
              display: 'Data submission and release policies',
              type: 'externalLink',
              url: makeExternalStaticPageUrl(
                communitySite,
                '/documents/VEuPathDB_Data_Sub_Release_policy_rev_02April2020.pdf'
              )
            }
          ]
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
              url: makeStaticPageRoute('/about.html#about_citing')
            },
            {
              key: 'data-access-policy',
              display: 'Data access policy',
              type: 'reactRoute',
              url: makeStaticPageRoute('/about.html#about_use')
            },
            {
              key: 'website-privacy-policy',
              display: 'Website privacy policy',
              type: 'reactRoute',
              url: makeStaticPageRoute('/privacyPolicy.html')
            }
          ]
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
              url: makeStaticPageRoute('/personnel.html')
            },
            {
              key: 'acknowledgement',
              display: 'Acknowledgements',
              type: 'reactRoute',
              url: makeStaticPageRoute('/acks.html')
            },
            {
              key: 'funding',
              display: 'Funding',
              type: 'reactRoute',
              url: makeStaticPageRoute('/about.html#about_funding')
            }
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
              url: '/documents/VEuPathDB_Section_508_BRC4.pdf'
            },
            { 
              key: 'methods',
              display: 'Analysis methods',
              type: 'reactRoute',
              tooltip: 'How we obtain/generate the data',
              url: makeStaticPageRoute(`/methods.html`)
            },
            {
              key: 'infrastructure',
              display: 'Infrastructure',
              type: 'reactRoute',
              url: makeStaticPageRoute('/infrastructure.html')
            },
            {
              key: 'usage-statistics',
              display: 'Website usage statistics',
              type: 'externalLink',
              url: '/awstats/awstats.pl',
              target: '_blank'
            }
          ]
        }
      ]
    },
    {
      key: 'help',
      display: 'Help',
      type: 'subMenu',
      items: [
        { 
          key: 'landing',
	  display: 'Learn how to use VEuPathDB',
          type: 'reactRoute',
          url: makeStaticPageRoute('/landing.html')
        },
        {
          key: 'our-glossary',
          display: `VEuPathDB glossary`,
          type: 'reactRoute',
          url: makeStaticPageRoute('/glossary.html')
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
          url: makeExternalStaticPageUrl(
                 communitySite,
                 '/documents/VEuPathDB_User_Documentation.pdf'
               )
        }
      ]
    },
    {
      key: 'contact-us',
      display: 'Contact Us',
      type: 'reactRoute',
      url: '/contact-us',
      target: '_blank'
    }
  ];

  // Don't render submenus until projectId and displayName have loaded
  const menuItemEntries: HeaderMenuItemEntry[] = fullMenuItemEntries.map(
    menuItemEntry =>
      menuItemEntry.type !== 'subMenu' || (projectId != null && displayName != null)
        ? menuItemEntry
        : {
            ...menuItemEntry,
            items: [
              {
                key: `${menuItemEntry.key}-loading`,
                display: <Loading />,
                type: 'custom'
              }
            ]
          }
  );

  return menuItemEntries.flatMap(
    menuItemEntry => filterMenuItemEntry(menuItemEntry, projectId)
  );
};

const filterMenuItemEntry = (
  menuItemEntry: HeaderMenuItemEntry, 
  projectId: string | undefined
): HeaderMenuItemEntry[] => 
  (
    menuItemEntry.metadata && 
    (
      (
        projectId != null && menuItemEntry.metadata.include && !menuItemEntry.metadata.include.includes(projectId)
      ) ||
      ( 
        projectId != null && menuItemEntry.metadata.exclude && menuItemEntry.metadata.exclude.includes(projectId)
      )
    )
  ) 
    ? []
    : menuItemEntry.type !== 'subMenu'
    ? [ menuItemEntry  ]
    : [
        {
          ...menuItemEntry,
          items: menuItemEntry.items.flatMap(
            menuItemEntry => filterMenuItemEntry(menuItemEntry, projectId)
          )
        }
      ];

// FIXME: Use a hook instead of "connect" to provide the global data
const mapStateToProps = (state: RootState) => ({
  // FIXME: This is not typesafe.
  searchTree: get(state.globalData, 'searchTree') as CategoryTreeNode,
  buildNumber: state.globalData.config?.buildNumber,
  releaseDate: state.globalData.config?.releaseDate,
  displayName: state.globalData.config?.displayName,
  projectId: state.globalData.siteConfig?.projectId
});

export const VEuPathDBHomePage = connect(mapStateToProps)(VEuPathDBHomePageView);
