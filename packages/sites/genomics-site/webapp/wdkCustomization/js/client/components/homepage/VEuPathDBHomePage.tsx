import React, { FunctionComponent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { get, memoize } from 'lodash';

import { ErrorBoundary } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { arrayOf, decode, string } from 'wdk-client/Utils/Json';

import Announcements from 'ebrc-client/components/Announcements';
import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header, HeaderMenuItem } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { SearchPane, SearchCheckboxTree } from 'ebrc-client/components/homepage/SearchPane';
import { combineClassNames, useAlphabetizedSearchTree } from 'ebrc-client/components/homepage/Utils';
import { useAnnouncementsState } from 'ebrc-client/hooks/announcements';

import { PageDescription } from './PageDescription';
import { makeVpdbClassNameHelper } from './Utils';

import { projectId } from 'ebrc-client/config';

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
  twitterUrl?: string,
  facebookUrl?: string,
  youtubeUrl?: string,
  buildNumber?: string,
  releaseDate?: string,
  displayName?: string
}

type Props = OwnProps & StateProps;

const IS_NEWS_EXPANDED_SESSION_KEY = 'homepage-is-news-expanded';
const SEARCH_TERM_SESSION_KEY = 'homepage-header-search-term';
const EXPANDED_BRANCHES_SESSION_KEY = 'homepage-header-expanded-branch-ids';

const VEuPathDBHomePageView: FunctionComponent<Props> = props => {
  const { isHomePage, classNameModifier } = props;
  const [ headerExpanded, setHeaderExpanded ] = useState(true);

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

  const projectId = useProjectId();
  const headerMenuItems = useHeaderMenuItems(
    props.searchTree, 
    searchTerm, 
    expandedBranches, 
    setSearchTerm, 
    setExpandedBranches,
    props.twitterUrl,
    props.facebookUrl,
    props.youtubeUrl,
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
    projectId
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
          branding={projectId}
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

const useProjectId = (): string => {
  // FIXME: Pull this from global data
  return projectId;
};

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
  twitterUrl?: string,
  facebookUrl?: string,
  youtubeUrl?: string
): HeaderMenuItem[] => {
  const projectId = useProjectId();
  const alphabetizedSearchTree = useAlphabetizedSearchTree(searchTree);
  const aboutRoute = makeStaticPageRoute(`/${projectId}/about.html`);
  const aboutAllRoute = makeStaticPageRoute('/aboutall/general.html');

  const menuItemEntries: HeaderMenuItemEntry[] = [
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
            exclude: [ FungiDB ]
          }
        },
        { 
          key: 'companion--fungi',
          display: 'Companion',
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
          type: 'webAppRoute',
          url: '/plasmoap.jsp',
          metadata: {
            include: [ PlasmoDB ]
          }
        },
        {
          key: 'pats',
          display: 'PATS',
          type: 'externalLink',
          url: 'http://modlabcadd.ethz.ch/software/pats/',
          target: '_blank',
          metadata: {
            include: [ PlasmoDB ]
          }
        },
        { 
          key: 'PopBio map',
          display: 'Population Biology map',
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
          url: `/pubcrawler/${projectId}`
        },
        { 
          key: 'analysis',
          display: 'Results analysis',
          type: 'reactRoute',
          url: makeStaticPageRoute('/analysisTools.html')
        },
        { 
          key: 'srt',
          display: 'Sequence retrieval',
          type: 'webAppRoute',
          url: '/srt.jsp'
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
          key: 'analysis',
          display: 'Analyze my strategy results',
          type: 'reactRoute',
          url: makeStaticPageRoute('/analysisTools.html')
        },
        {
          key: 'basket',
          display: 'Basket',
          type: 'reactRoute',
          url: '/workspace/basket'
        },
        {
          key: 'user-data-sets',
          display: 'Data sets',
          type: 'reactRoute',
          url: '/workspace/datasets'
        },
        {   
          key: 'favorites',
          display: 'Favorites',
          type: 'reactRoute',
          url: '/workspace/favorites'
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
          display: 'Data sets',
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
          type: 'webAppRoute',
          tooltip: 'Access MaHPIC Data',
          url: '/mahpic.jsp',
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
          tooltip: `Table summarizing all the genomes and their different data types available in ${projectId}`,
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
          display: `What is ${projectId}?`,
          type: 'reactRoute',
          url: aboutRoute
        },
        {
          key: 'eupathdb-publications',
          display: 'Publications on VEuPathDB sites',
          type: 'reactRoute',
          url: makeStaticPageRoute('/veupathPubs.html')
        },
        {
          key: 'community-divider',
          display: (
            <SubmenuDivider>
              Community
            </SubmenuDivider>
          ),
          type: 'custom'
        },
        { 
          key: 'news',
          display: 'News',
          type: 'reactRoute',
          url: makeStaticPageRoute(`/${projectId}/news.html`)
        },
        {
          key: 'related-sites',
          display: 'Related sites',
          type: 'reactRoute',
          url: makeStaticPageRoute(`/${projectId}/externalLinks.html`)
        },
        {
          key: 'public-strategies',
          display: 'Public strategies',
          type: 'reactRoute',
          url: '/workspace/strategies/public'
        },
        {
          key: 'submitting-divider',
          display: (
            <SubmenuDivider>
              Submitting data to {projectId}
            </SubmenuDivider>
          ),
          type: 'custom'
        },
        {
          key: 'submission-instructions',
          display: 'How to submit data to us',
          type: 'webAppRoute',
          url: '/dataSubmission.jsp'
        },
        {
          key: 'submission-policy',
          display: 'VEuPathDB data submission & release policies',
          type: 'externalLink',
          url: '/EuPathDB_datasubm_SOP.pdf'
        },
        {
          key: 'usage-and-citations-divider',
          display: (
            <SubmenuDivider>
              Usage and citation
            </SubmenuDivider>
          ),
          type: 'custom'
        },
        {
          key: 'cite-us',
          display: 'How to cite us',
          type: 'reactRoute',
          url: `${aboutRoute}#citing`
        },
        {
          key: 'cite-data-provide',
          display: 'Citing data providers',
          type: 'reactRoute',
          url: `${aboutRoute}#citingproviders`
        },
        {
          key: 'citations',
          display: 'Publications that use our resources',
          type: 'externalLink',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
        },
        {
          key: 'data-access-policy',
          display: 'Data Access Policy',
          type: 'reactRoute',
          url: `${aboutRoute}#use`
        },
        {
          key: 'website-privacy-policy',
          display: 'Website privacy policy',
          type: 'externalLink',
          url: '/documents/EuPathDB_Website_Privacy_Policy.shtml'
        },
        {
          key: 'who-are-we-divider',
          display: (
            <SubmenuDivider>
              Who are we?
            </SubmenuDivider>
          ),
          type: 'custom'
        },
        {
          key: 'scientific-working-group',
          display: 'Scientific working group',
          type: 'reactRoute',
          url: `${aboutAllRoute}#swg`
        },
        {
          key: 'scientific-advisory-team',
          display: 'Scientific advisory team',
          type: 'reactRoute',
          url: `${aboutRoute}#advisors`
        },
        {
          key: 'acknowledgement',
          display: 'Acknowledgements',
          type: 'reactRoute',
          url: `${aboutAllRoute}#acks`
        },
        {
          key: 'funding',
          display: 'Funding',
          type: 'reactRoute',
          url: `${aboutRoute}#funding`
        },
        {
          key: 'brochure',
          display: 'EuPathDB Brochure',
          type: 'externalLink',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'
        },
        {
          key: 'brochure-chinese',
          display: 'EuPathDB brochure in Chinese',
          type: 'externalLink',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'
        },
        {
          key: 'technical-divider',
          display: (
            <SubmenuDivider>
              Technical
            </SubmenuDivider>
          ),
          type: 'custom'
        },        
        {
          key: 'accessibility-vpat',
          display: 'Accessibility VPAT',
          type: 'externalLink',
          url: '/documents/VEuPathDB_Section_508.pdf'
        },
        {
          key: 'infrastructure',
          display: 'EuPathDB Infrastructure',
          type: 'reactRoute',
          url: makeStaticPageRoute('/infrastructure.html')
        },
        {
          key: 'usage-statistics',
          display: 'Website Usage Statistics',
          type: 'externalLink',
          url: '/awstats/awstats.pl'
        }
      ]
    },
    {
      key: 'help',
      display: 'Help',
      type: 'subMenu',
      items: [
        {
          key: 'eupathdb-workshop',
          display: 'EuPathDB workshop',
          type: 'externalLink',
          url: 'http://workshop.eupathdb.org/current/'
        },
        {
          key: 'workshop-exercises',
          display: 'Exercises from workshop',
          type: 'externalLink',
          url: 'http://workshop.eupathdb.org/current/index.php?page=schedule'
        },
        {
          key: 'ncbi-glossary',
          display: `NCBI's glossary of terms`,
          type: 'externalLink',
          url: 'http://www.genome.gov/Glossary/'
        },
        {
          key: 'our-glossary',
          display: `Our glossary`,
          type: 'reactRoute',
          url: makeStaticPageRoute('/glossary.html')
        },
        {
          key: 'reset-session',
          display: `Reset ${projectId} Session`,
          tooltip: 'Login first to keep your work',
          type: 'webAppRoute',
          url: '/resetSession.jsp',
        },
        {
          key: 'youtube-tutorials',
          display: 'YouTube tutorials',
          type: 'externalLink',
          url: 'http://www.youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1'
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

  return menuItemEntries.flatMap(
    menuItemEntry => filterMenuItemEntry(menuItemEntry, projectId)
  );
};

const SubmenuDivider: React.FunctionComponent = ({ children }) => 
  <div className={vpdbCx('SubmenuDivider')}>
    {children}
  </div>;

const filterMenuItemEntry = (
  menuItemEntry: HeaderMenuItemEntry, 
  projectId: string
): HeaderMenuItemEntry[] => 
  (
    menuItemEntry.metadata && 
    (
      (
        menuItemEntry.metadata.include && !menuItemEntry.metadata.include.includes(projectId)
      ) ||
      ( 
        menuItemEntry.metadata.exclude && menuItemEntry.metadata.exclude.includes(projectId)        
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
  twitterUrl: state.globalData.siteConfig?.twitterUrl,
  facebookUrl: state.globalData.siteConfig?.facebookUrl,
  youtubeUrl: state.globalData.siteConfig?.youtubeUrl,
  buildNumber: state.globalData.config?.buildNumber,
  releaseDate: state.globalData.config?.releaseDate,
  displayName: state.globalData.config?.displayName,
});

export const VEuPathDBHomePage = connect(mapStateToProps)(VEuPathDBHomePageView);
