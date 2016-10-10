import { PropTypes } from 'react';
import { add, compose, pick, reduce } from 'lodash';
import QuickSearch from './QuickSearch';
import SmallMenu from './SmallMenu';
import Announcements from 'eupathdb/wdkCustomization/js/client/components/Announcements';
import Menu from './Menu';
import * as projectConfig from '../config';
import { getSearchMenuCategoryTree } from '../util/category';
import { formatReleaseDate } from '../util/modelSpecificUtil';
import { withActions, withStore } from '../util/component';
import { getId, getDisplayName, getTargetType } from 'wdk-client/CategoryUtils';
import { UserActionCreators } from 'wdk-client/ActionCreators'
import { SHOW_GALAXY_PAGE_PREFERENCE } from './controllers/GalaxyTermsController';

let { projectId, twitterId, facebookId, buildNumber, webAppUrl, releaseDate, announcements } = projectConfig;

/* eslint-disable no-unused-vars */
let isAmoebaDB = projectId === 'AmoebaDB';
let isCryptoDB = projectId === 'CryptoDB';
let isGiardiaDB = projectId === 'GiardiaDB';
let isMicrosporidiaDB = projectId === 'MicrosporidiaDB';
let isPiroplasmaDB = projectId === 'PiroplasmaDB';
let isPlasmoDB = projectId === 'PlasmoDB';
let isToxoDB = projectId === 'ToxoDB';
let isTrichDB = projectId === 'TrichDB';
let isTriTrypDB = projectId === 'TriTrypDB';
let isEuPathDB = projectId === 'EuPathDB';
let isMicrobiomeDB = projectId === 'MicrobiomeDB';
/* eslint-enable no-unused-vars */

/** Header */
function Header(props) {
  let { basketCounts, ontology, preferences, quickSearches, recordClasses,
    showLoginForm, showLoginWarning, showLogoutWarning, user } = props;
  let totalBasketCount = reduce(basketCounts, add, 0);
  let shouldShowGalaxyOrientation = preferences && preferences[SHOW_GALAXY_PAGE_PREFERENCE] !== 'false';
  return (
    <div>
      <div id="header">
        <div id="header2">
          <div id="header_rt">
            {!isMicrobiomeDB &&
              <div id="toplink">
                <a href="http://eupathdb.org">
                  <img alt="Link to EuPathDB homepage" src={webAppUrl + '/images/' + projectId + '/partofeupath.png'}/>
                </a>
              </div>
            }
            {!isMicrobiomeDB &&
              <QuickSearch webAppUrl={webAppUrl} questions={quickSearches}/>
            }
            {user && <SmallMenu projectConfig={projectConfig} user={user} onLogin={showLoginForm} onLogout={showLogoutWarning} />}
          </div>
          <a id={projectId} href="/">
            <img alt={"Link to " + projectId + " homepage"} style={{ textAlign: "left" }} src={webAppUrl + "/images/" + projectId + "/title_s.png"}/>
          </a>
          <span style={{
            display: 'inline-block',
            verticalAlign: 'top'
          }}>
            <span id="rel-num">Release {buildNumber}</span><br/>
            <span id="rel-date">{formatReleaseDate(releaseDate)}</span>
          </span>
        </div>
        {/* TODO Put entries into an external JSON file. */}
        <Menu webAppUrl={webAppUrl} showLoginWarning={showLoginWarning} isGuest={user ? user.isGuest : true} entries={[
          { id: 'home', text: 'Home', tooltip: 'Go to the home page', url: webAppUrl },
          { id: 'search', text: 'New Search', tooltip: 'Start a new search strategy', children: [
            ...getSearchEntries(ontology, recordClasses),
            { id: 'query-grid', text: 'View all available searches', route: 'query-grid' }
          ]},
          { id: 'strategies', text: 'My Strategies',  webAppUrl: '/showApplication.do' },
          {
            id: 'basket',
            text: <span>My Basket <span style={{ color: '#600000' }}>({totalBasketCount})</span></span>,
            webAppUrl: '/showApplication.do?tab=basket',
            loginRequired: true
          },
          ...(isMicrobiomeDB ? [
            { id: 'data-summary', text: 'Data Summary', children: [
              {
                id: 'datasets',
                text: 'Data Sets',
                route: 'search/dataset/AllDatasets/result'
              }
            ] }
          ] : [
          { id: 'tools', text: 'Tools', children: [
            { id: 'blast', text: 'BLAST',  webAppUrl: '/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast' },
            {
              id: 'analysis',
              text: 'Results Analysis',
              webAppUrl: '/analysisTools.jsp',
              beta: true
            },
            {
              id: 'srt',
              text: 'Sequence Retrieval',
              webAppUrl: '/srt.jsp'
            },
            // {
            //   id: 'pathogen-portal',
            //   text: 'Pathogen Portal',
            //   url: 'http://rnaseq.pathogenportal.org'
            // },
            {
              id: 'companion',
              text: 'Companion',
              tooltip: 'Annotate your sequence and determine orthology, phylogeny & synteny',
              url: 'https://companion.sanger.ac.uk'
            },
            {
              id: 'EuPaGDT',
              text: 'EuPaGDT',
              tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
              url: 'http://grna.ctegd.uga.edu'
            },
            {
              id: 'pubcrawler',
              text: 'PubMed and Entrez',
              url: '/pubcrawler/PlasmoDB'
            },
            {
              id: 'gbrowse',
              text: 'Genome Browser',
              url: '/cgi-bin/gbrowse/' + projectId.toLowerCase(),
              exclude: 'EuPathDB'
            },
            ...(isPlasmoDB ? [
              {
                id: 'plasmoap',
                text: 'PlasmoAP',
                url: 'http://v4-4.plasmodb.org/restricted/PlasmoAPcgi.shtml'
              },
              {
                id: 'pats',
                text: 'PATS',
                url: 'http://gecco.org.chemie.uni-frankfurt.de/pats/pats-index.php'
              },
              {
                id: 'plasmit',
                text: 'PlasMit',
                url: 'http://gecco.org.chemie.uni-frankfurt.de/plasmit'
              }
            ] : []),
            ...(isToxoDB ? [
              {
                id: 'ancillary-genome-browser',
                text: 'Ancillary Genome Browser',
                url: 'http://ancillary.toxodb.org'
              }
            ] : []),
            {
              id: 'webservices',
              text: 'Searched via Web Services',
              webAppUrl: '/serviceList.jsp'
            }
          ]},
          { id: 'data-summary', text: 'Data Summary', children: [
            {
              id: 'datasets',
              text: 'Data Sets',
              route: 'search/dataset/AllDatasets/result'
            },
            {
              id: 'analysis-methods',
              text: 'Analysis Methods',
              webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Methods'
            },
            ...(isCryptoDB ?[
              {
                id: 'annotation-sops',
                text: <span>SOPs for <i>C.parvum</i> Annotation</span>,
                url: 'http://cryptodb.org/static/SOP/'
              }
            ] : []),
            {
              id: 'genomes-and-data-types',
              text: 'Genomes and Data Types',
              webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes',
              tooltip: 'Table summarizing all the genomes and their different data types available in ' + projectId
            },
            {
              id: 'gene-metrics',
              text: 'Gene Metrics',
              tooltip: 'Table summarizing gene counts for all the available genomes, and evidence supporting them',
              webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics'
            }
          ]},
          { id: 'downloads', text: 'Downloads', children: [
            {
              id: 'about-downloads',
              text: 'Understanding Downloads',
              webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#downloads'
            },
            ...(!isEuPathDB ? [
              {
                id: 'data-files',
                text: 'Data Files',
                url: '/common/downloads',
                exclude: 'EuPathDB'
              }
            ] : [
              {
                id: 'data-files',
                text: 'Data Files',
                children: [
                  {
                    id: 'AmoebaDB',
                    text: 'AmoebaDB',
                    url: 'http://amoebadb.org/common/downloads'
                  },
                  {
                    id: 'CryptoDB',
                    text: 'CryptoDB',
                    url: 'http://cryptodb.org/common/downloads'
                  },
                  {
                    id: 'GiardiaDB',
                    text: 'GiardiaDB',
                    url: 'http://giardiadb.org/common/downloads'
                  },
                  {
                    id: 'MicrosporidiaDB',
                    text: 'MicrosporidiaDB',
                    url: 'http://microsporidiadb.org/common/downloads'
                  },
                  {
                    id: 'PiroplasmaDB',
                    text: 'PiroplasmaDB',
                    url: 'http://piroplasmadb.org/common/downloads'
                  },
                  {
                    id: 'PlasmoDB',
                    text: 'PlasmoDB',
                    url: 'http://plasmodb.org/common/downloads'
                  },
                  {
                    id: 'ToxoDB',
                    text: 'ToxoDB',
                    url: 'http://toxodb.org/common/downloads'
                  },
                  {
                    id: 'TrichDB',
                    text: 'TrichDB',
                    url: 'http://trichdb.org/common/downloads'
                  },
                  {
                    id: 'TriTrypDB',
                    text: 'TriTrypDB',
                    url: 'http://tritrypdb.org/common/downloads'
                  }
                ]
              }
            ]),
            {
              id: 'srt',
              text: 'Sequence Retrieval',
              webAppUrl: '/srt.jsp'
            },
            ...(!isEuPathDB ? [
              {
                id: 'community-upload',
                text: 'Upload Community Files',
                webAppUrl: '/communityUpload.jsp'
              },
              {
                id: 'community-download',
                text: 'Download Community Files',
                webAppUrl: '/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads'
              }
            ] : []),
            {
              id: 'eupathdb-publications',
              text: 'EuPathDB Publications',
              webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs'
            }
          ]},
          { id: 'community', text: 'Community', children: [
            {
              id: 'twitter',
              text: <div><span className="twitter small"></span>&nbsp;&nbsp;&nbsp;&nbsp;Follow us on Twitter!</div>,
              url: 'http://twitter.com/' + twitterId,
              target: '_blank'
            },
            {
              id: 'facebook',
              text: <div><span className="facebook small"></span>&nbsp;&nbsp;&nbsp;&nbsp;Follow us on Facebook!</div>,
              url: 'http://facebook.com' + facebookId,
              target: '_blank'
            },
            {
              id: 'youtube',
              text: <div><span className="youtube small"></span>&nbsp;&nbsp;&nbsp;&nbsp;Follow us on YouTube!</div>,
              url: 'http://www.youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1',
              target: '_blank'
            },
            {
              id: 'release-policy',
              text: 'EuPathDB Data Submission & Release Policies',
              url: '/EuPathDB_datasubm_SOP.pdf'
            },
            ...(!isEuPathDB ? [
              {
                id: 'comments',
                text: 'Find Genes with Comments from the ' + projectId + ' Community',
                tooltip: 'Add your comments to your gene of interest: start at the gene page',
                webAppUrl: '/showSummary.do?questionFullName=GeneQuestions.GenesWithUserComments&value(timestamp)=817205'
              },
              {
                id: 'community-upload',
                text: 'Upload Community Files',
                webAppUrl: '/communityUpload.jsp'
              },
              {
                id: 'community-download',
                text: 'Download Community Files',
                webAppUrl: '/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads'
              }
            ] : []),
            {
              id: 'events',
              text: 'Upcoming Events',
              webAppUrl: '/communityEvents.jsp'
            },
            {
              id: 'related-sites',
              text: 'Related Sites',
              webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.ExternalLinks'
            },
            {
              id: 'public-strategies',
              text: 'Public Strategies',
              webAppUrl: '/showApplication.do?tab=public_strat'
            }
          ]},
          {
            id: 'analyze',
            text: 'Analyze My Experiment',
            new: true,
            route: shouldShowGalaxyOrientation ? 'galaxy-orientation' : undefined,
            url: !shouldShowGalaxyOrientation ? 'https://eupathdb.globusgenomics.org/' : undefined,
            target: !shouldShowGalaxyOrientation ? '_blank' : undefined
          }]),
          {
            id: 'favorites',
            text: (
              <div>
                <span className="fa-stack fa-pull-left"
                  style={{
                    position: 'relative',
                    top: '-16px',
                    fontSize: '1.8em',
                    marginRight: '-6px',
                    marginLeft: '-18px'
                  }}>
                  <i className="fa fa-star fa-stack-1x" style={{color: 'yellow'}}/>
                  <i className="fa fa-star-o fa-stack-1x" style={{color: '#eb971f'}}/>
                </span>
                {' My Favorites'}
              </div>
            ),
            webAppUrl: '/showFavorite.do',
            loginRequired: true
          }
        ]}/>
      </div>
      <Announcements projectId={projectId} webAppUrl={webAppUrl} announcements={announcements}/>
    </div>
  );
}

Header.propTypes = {
  user: PropTypes.object,
  ontology: PropTypes.object,
  recordClasses: PropTypes.array,
  basketCounts: PropTypes.object,
  quickSearches: PropTypes.array,
  preferences: PropTypes.object
};

let globalDataItems = Object.keys(Header.propTypes);

let connect = compose(
  withStore(state => pick(state.globalData, globalDataItems)),
  withActions(UserActionCreators)
);

export default connect(Header);


// helpers

/**
 * Map search tree to menu entries
 */
function getSearchEntries(ontology, recordClasses) {
  if (ontology == null || recordClasses == null) return [];
  return getSearchMenuCategoryTree(ontology, recordClasses, {})
    .children.map(createMenuEntry);
}

/** Map a search node to a meny entry */
function createMenuEntry(searchNode) {
  return {
    id: getId(searchNode),
    text: getDisplayName(searchNode),
    children: searchNode.children.map(createMenuEntry),
    webAppUrl: getTargetType(searchNode) === 'search' &&
      '/showQuestion.do?questionFullName=' + getId(searchNode)
  };
}
