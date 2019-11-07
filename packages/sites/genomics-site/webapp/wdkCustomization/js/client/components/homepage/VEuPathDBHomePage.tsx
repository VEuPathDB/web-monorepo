import React, { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { get } from 'lodash';

import { ErrorBoundary } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { Footer } from 'ebrc-client/components/homepage/Footer';
import { Header, HeaderMenuItem } from 'ebrc-client/components/homepage/Header';
import { Main } from 'ebrc-client/components/homepage/Main';
import { NewsPane } from 'ebrc-client/components/homepage/NewsPane';
import { SearchPane, SearchCheckboxTree } from 'ebrc-client/components/homepage/SearchPane';
import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import { projectId } from '../../config';

import './VEuPathDBHomePage.scss';

const vpdbCx = makeClassNameHelper('vpdb-');

type StateProps = {
  searchTree?: CategoryTreeNode
}

type Props = StateProps;

const GENE_ITEM_ID = 'category:transcript-record-classes-transcript-record-class';

const VEuPathDBHomePageView: FunctionComponent<Props> = props => {
  const [ siteSearchSuggestions, setSiteSearchSuggestions ] = useState<string[] | undefined>(undefined);
  const [ additionalSuggestions, setAdditionalSuggestions ] = useState<{ key: string, display: ReactNode }[]>([]);
  const [ headerExpanded, setHeaderExpanded ] = useState(true);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ expandedBranches, setExpandedBranches ] = useState([ GENE_ITEM_ID ]);

  const projectId = useProjectId();
  const headerMenuItems = useHeaderMenuItems(props.searchTree, searchTerm, expandedBranches, setSearchTerm, setExpandedBranches);

  const updateHeaderExpanded = useCallback(() => {
    // FIXME - find a better way to update the header height - this resizing is "jerky" when 
    // the scroll bar is left near the scroll threshold
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

  const preloadedSuggestions = useMemo(
    () => [
      'protein',
      'protein motifs',
      'proteomics',
      'protozoa',
    ],
    []
  );

  const loadSuggestions = useCallback((searchTerm: string) => {
    if (searchTerm) {
      setSiteSearchSuggestions(
        [
          searchTerm,
          ...preloadedSuggestions
        ].sort()
      );
    } else {
      setSiteSearchSuggestions(undefined);
    }
  }, []);

  const rootContainerClassName = combineClassNames(
    vpdbCx('RootContainer', headerExpanded ? 'header-expanded' : 'header-collapsed'), 
    projectId
  );
  const headerClassName = combineClassNames(
    vpdbCx('Header', headerExpanded ? 'expanded' : 'collapsed'), 
    vpdbCx('BgDark')
  );
  const searchPaneClassName = combineClassNames(vpdbCx('SearchPane'), vpdbCx('BgWash'));
  const mainClassName = vpdbCx('Main');
  const newsPaneClassName = vpdbCx('NewsPane');
  const footerClassName = vpdbCx('Footer'); 

  return (
    <div className={rootContainerClassName}>
      <ErrorBoundary>
        <Header 
          // FIXME: use project logos for component site branding 
          branding={projectId}
          menuItems={headerMenuItems} 
          containerClassName={headerClassName} 
          loadSuggestions={loadSuggestions}
          siteSearchSuggestions={siteSearchSuggestions}
          additionalSuggestions={additionalSuggestions}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <SearchPane 
          containerClassName={searchPaneClassName} 
          searchTree={props.searchTree}
        />
      </ErrorBoundary>
      <Main containerClassName={mainClassName}>
        {props.children}
      </Main>
      <ErrorBoundary>
        <NewsPane containerClassName={newsPaneClassName} />
      </ErrorBoundary>
      <ErrorBoundary>
        <Footer containerClassName={footerClassName} />
      </ErrorBoundary>
    </div>
  );
}

const PlasmoDB = 'PlasmoDB';
const TriTrypDB = 'TriTrypDB';
const CryptoDB = 'CryptoDB';
const ToxoDB = 'ToxoDB';
const FungiDB  = 'FungiDB';
const EuPathDB = 'EuPathDB';

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
  setExpandedBranches: (newExpandedBranches: string[]) => void
): HeaderMenuItem[] => {
  const projectId = useProjectId();

  const menuItemEntries: HeaderMenuItemEntry[] = [
    {
      key: 'searchContainer',
      display: 'Searches',
      type: 'subMenu',
      items: [
        {
          key: 'searches',
          display: (
            <SearchCheckboxTree 
              searchTree={searchTree} 
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
          key: 'analysis',
          display: 'Results analysis',
          type: 'webAppRoute',
          url: '/analysisTools.jsp'
        },
        {
          key: 'srt',
          display: 'Sequence Retrieval',
          type: 'webAppRoute',
          url: '/srt.jsp'
        },
        {
          key: 'galaxy',
          display: 'Analyze my experiment',
          type: 'reactRoute',
          url: '/galaxy-orientation'
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
          key: 'EuPaGDT',
          display: 'EuPaGDT',
          type: 'externalLink',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'http://grna.ctegd.uga.edu',
          target: '_blank'
        },
        {
          key: 'pubcrawler',
          display: 'PubMed and Entrez',
          type: 'externalLink',
          url: `/pubcrawler/${projectId}`
        },
        {
          key: 'jbrowse',
          display: 'Genome Browser',
          type: 'externalLink',
          url: '/a/jbrowse.jsp?data=/a/service/jbrowse/tracks/default&tracks=gene',
          metadata: {
            exclude: [ EuPathDB ]
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
          key: 'ancillary-genome-browser',
          display: 'Ancillary Genome Browser',
          type: 'externalLink',
          url: 'http://ancillary.toxodb.org',
          target: '_blank',
          metadata: {
            include: [ ToxoDB ]
          }
        },
        {
          key: 'webservices',
          display: 'Searches via Web Services',
          type: 'externalLink',
          url: '/documents/WebServicesURLBuilderHELPPAGE.pdf'
        }
      ]
    },
    {
      key: 'workspace',
      display: 'Workspace',
      type: 'subMenu',
      items: [
        {
          key: 'search-strategies',
          display: 'My search strategies',
          type: 'reactRoute',
          url: '/workspace/strategies'
        },
        {
          key: 'user-data-sets',
          display: 'My data sets',
          type: 'reactRoute',
          url: '/workspace/datasets'
        },
        {
          key: 'basket',
          display: 'My basket',
          type: 'reactRoute',
          url: '/workspace/basket'
        },
        {
          key: 'galaxy-analyses',
          display: 'My Galaxy analyses',
          type: 'reactRoute',
          url: '/galaxy-orientation'
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
          key: 'analysis-methods',
          display: 'Methods',
          type: 'webAppRoute',
          url: '/wdkCustomization/jsp/questions/XmlQuestions.Methods.jsp'
        },
        {
          key: 'genomes-and-data-types',
          display: 'Organisms - Data type summary',
          tooltip: `Table summarizing all the genomes and their different data types available in ${projectId}`,
          type: 'reactRoute',
          url: '/search/organism/GenomeDataTypes'
        },
        {
          key: 'gene-metrics',
          display: 'Organisms - Gene metrics',
          tooltip: 'Table summarizing gene counts for all the available genomes, and evidence supporting them',
          type: 'reactRoute',
          url: '/search/organism/GeneMetrics'
        },
        {
          key: 'data-files-eupathdb',
          display: 'Download data files',
          type: 'externalLink',
          url: '/common/downloads',
          metadata: {
            exclude: [ EuPathDB ]
          }
        }
      ]
    },
    {
      key: 'community',
      display: 'Community',
      type: 'subMenu',
      items: [
        {
          key: 'comments',
          display: `Genes with comments from the ${projectId} community`,
          tooltip: 'Add your comments to your gene of interest: start at the gene page',
          type: 'reactRoute',
          url: '/search/gene/GenesWithUserComments',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        {
          key: 'public-strategies',
          display: 'Public strategies',
          type: 'reactRoute',
          url: '/workspace/strategies/public'
        },
        {
          key: 'community-download',
          display: 'Community files',
          type: 'reactRoute',
          url: '/search/file/UserFileUploads',
          metadata: {
            exclude: [ EuPathDB ]
          }
        },
        {
          key: 'release-policy',
          display: 'VEuPathDB data submission & release policies',
          type: 'externalLink',
          url: '/EuPathDB_datasubm_SOP.pdf'
        },
        {
          key: 'related-sites',
          display: 'Related sites',
          type: 'webAppRoute',
          url: '/wdkCustomization/jsp/questions/XmlQuestions.ExternalLinks.jsp'
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
        }
      ]
    }
  ];

  return menuItemEntries.flatMap(
    menuItemEntry => filterMenuItemEntry(menuItemEntry, projectId)
  );
};

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

// FIXME: Use a hook instead of "connect" to provide the searchTree
const mapStateToProps = (state: RootState) => ({
  // FIXME: This is not typesafe.
  searchTree: get(state.globalData, 'searchTree') as CategoryTreeNode
});

export const VEuPathDBHomePage = connect(mapStateToProps)(VEuPathDBHomePageView);
