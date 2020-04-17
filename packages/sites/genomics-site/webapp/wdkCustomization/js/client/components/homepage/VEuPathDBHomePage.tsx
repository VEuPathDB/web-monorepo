import React, { FunctionComponent, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { connect } from 'react-redux';

import { get, memoize } from 'lodash';

import { Loading } from 'wdk-client/Components';
import { ErrorBoundary } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { arrayOf, decode, string } from 'wdk-client/Utils/Json';

import Announcements from 'ebrc-client/components/Announcements';
import CookieBanner from 'ebrc-client/components/CookieBanner';
import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header, HeaderMenuItem } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { SearchPane, SearchCheckboxTree } from 'ebrc-client/components/homepage/SearchPane';
import { combineClassNames, useAlphabetizedSearchTree } from 'ebrc-client/components/homepage/Utils';
import { useAnnouncementsState } from 'ebrc-client/hooks/announcements';

import { useCommunitySiteUrl } from 'ebrc-client/hooks/staticData';

import { PageDescription } from './PageDescription';
import { makeVpdbClassNameHelper } from './Utils';

import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';
import { STATIC_ROUTE_PATH } from 'ebrc-client/routes';

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

  const updateHeaderExpanded = useCallback(() => {
    setHeaderExpanded(document.body.scrollTop <= 80 && document.documentElement.scrollTop <= 80);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', updateHeaderExpanded, { passive: true });
    window.addEventListener('touch', updateHeaderExpanded, { passive: true });
    window.addEventListener('wheel', updateHeaderExpanded, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderExpanded);
      window.removeEventListener('touch', updateHeaderExpanded);
      window.removeEventListener('wheel', updateHeaderExpanded);
    };
  }, [ updateHeaderExpanded ]);

  useEffect(() => {
    updateHeaderExpanded();
  }, [ isHomePage ]);

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
  const footerClassName = vpdbCx('Footer'); 

  const [ closedBanners, setClosedBanners ] = useAnnouncementsState();

  const onShowAnnouncements = useCallback(() => {
    setClosedBanners([]);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [ setClosedBanners ]);

  return (
    <div className={rootContainerClassName}>
      <ErrorBoundary>
        <Header 
          branding={props.projectId}
          menuItems={headerMenuItems} 
          containerClassName={headerClassName} 
          onShowAnnouncements={onShowAnnouncements}
          showAnnouncementsToggle={isHomePage && closedBanners.length > 0}
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
        <Footer
          containerClassName={footerClassName}
          buildNumber={props.buildNumber}
          releaseDate={props.releaseDate}
          displayName={props.displayName}
        >
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

const VectorBase = 'VectorBase';
const PlasmoDB = 'PlasmoDB';
const TriTrypDB = 'TriTrypDB';
const CryptoDB = 'CryptoDB';
const ToxoDB = 'ToxoDB';
const FungiDB  = 'FungiDB';
const EuPathDB = 'EuPathDB';

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
  const communitySite = useCommunitySiteUrl();

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
          type: 'externalLink',
          url: 'https://apollo.veupathdb.org/',
          target: '_blank',
          metadata: {
            include: [ VectorBase ]
         }
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
          url: 'http://grna.ctegd.uga.edu',
          target: '_blank'
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
          url: '/jbrowse?data=/a/service/jbrowse/tracks/default&tracks=gene',
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
          type: 'externalLink',
          url: 'https://www.vectorbase.org/image-gallery',
          target: '_blank',
          metadata: {
            include: [ EuPathDB,VectorBase ]
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
          url: makeStaticPageRoute('/webServices.html')
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
          display: 'Basket',
          type: 'reactRoute',
          url: '/workspace/basket'
        },
        {   
          key: 'favorites',
          display: 'Favorites',
          type: 'reactRoute',
          url: '/workspace/favorites'
        },
        {
          key: 'user-data-sets',
          display: 'My data sets',
          type: 'reactRoute',
          url: '/workspace/datasets',
          metadata: {
            exclude: [ EuPathDB ]
          }
        }
      ]
    },
    {
      key: 'data',
      display: 'Data',
      type: 'subMenu',
      items: [
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
          key: 'analysis-methods',
          display: 'Methods',
          type: 'reactRoute',
          url: makeStaticPageRoute('/methods.html')
        },
        {
          key: 'genomes-and-data-types',
          display: 'Organisms - Data type summary',
          tooltip: `Table summarizing all the genomes and their different data types available in ${displayName}`,
          type: 'reactRoute',
          url: '/search/organism/GenomeDataTypes/result'
        },
        {
          key: 'gene-metrics',
          display: 'Organisms - Gene metrics',
          tooltip: 'Table summarizing gene counts for all the available genomes, and evidence supporting them',
          type: 'reactRoute',
          url: '/search/organism/GeneMetrics/result'
        },
        { 
          key: 'annotation-sops',
          display: <>SOPs for <i>C.parvum</i> Annotation</>,
          type: 'externalLink',
          url: 'http://cryptodb.org/static/SOP/',
          metadata: {
            include: [ CryptoDB ],
          }
        },
        {
          key: 'community-download',
          display: 'User uploaded files',
          type: 'reactRoute',
          url: '/search/file/UserFileUploads/result',
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
          key: 'community',
          type: 'subMenu',
          display: 'Community',
          items: [
            { 
              key: 'scientific-advisory-team',
              display: 'Community advisors',
              type: 'reactRoute',
              url: makeStaticPageRoute('/advisors.html')
            },
            { 
              key: 'news',
              display: 'News',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/${displayName}/news.html`)
            },
            { 
              key: 'public-strategies',
              display: 'Public strategies',
              type: 'reactRoute',
              url: '/workspace/strategies/public'
            },
            { 
              key: 'related-sites',
              display: 'Related sites',
              type: 'reactRoute',
              url: makeStaticPageRoute(`/${displayName}/externalLinks.html`)
            },
            { 
              key: 'workshops-events',
              display: 'Workshops and training',
              type: 'reactRoute',
              url: makeStaticPageRoute('/webinars_workshops.html')
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
              url: '/documents/VEuPathDB_Section_508.pdf'
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
          key: 'youtube-tutorials',
          display: 'YouTube tutorials',
          type: 'externalLink',
          url: 'http://www.youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1',
          target: '_blank'
        },
        { 
          key: 'eupathdb-workshop',
          display: 'VEuPathDB workshops',
          type: 'reactRoute',
          url: makeStaticPageRoute('/webinars_workshops.html')
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
