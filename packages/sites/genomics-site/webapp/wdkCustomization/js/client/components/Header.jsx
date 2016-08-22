import { PropTypes } from 'react';
import { add, compose, pick, reduce } from 'lodash';
import QuickSearch from './QuickSearch';
import SmallMenu from './SmallMenu';
import Menu from './Menu';
import * as projectConfig from '../config';
import { getSearchMenuCategoryTree } from '../util/category';
import { formatReleaseDate } from '../util/modelSpecificUtil';
import { withActions, withStore } from '../util/component';
import { getId, getDisplayName, getTargetType } from 'wdk-client/CategoryUtils';
import { UserActionCreators } from 'wdk-client/ActionCreators'

let { projectId, twitterId, facebookId, buildNumber, webAppUrl, releaseDate } = projectConfig;

// FIXME Read from model and add additional parameters for text search
let quickSearches = [
  {
    name: 'GeneQuestions.GeneBySingleLocusTag',
    displayName: 'Gene ID',
    textParamName: 'value(single_gene_id)',
    textParamDefaultValue: 'PF3D7_1133400',
    help: "Use * as a wildcard in a gene ID. Click on 'Gene ID' to enter multiple Gene IDs."
  },
  {
    name: 'GeneQuestions.GenesByTextSearch',
    displayName: 'Gene Text Search',
    textParamName: 'value(single_gene_id)',
    textParamDefaultValue: 'PF3D7_1133400',
    help: "Use * as a wildcard in a gene ID. Click on 'Gene ID' to enter multiple Gene IDs."
  }
];

let connect = compose(
  withStore(state => pick(state.globalData, 'user', 'ontology', 'recordClasses', 'basketCounts')),
  withActions(UserActionCreators)
);

/** Header */
function Header(props) {
  let { user, ontology, recordClasses, basketCounts, showLoginForm, showLoginWarning, showLogoutWarning } = props;
  let totalBasketCount = reduce(basketCounts, add, 0);
  return (
    <div id="header">
      <div id="header2">
        <div id="header_rt">
          <div id="toplink">
            <a href="http://eupathdb.org">
              <img alt="Link to EuPathDB homepage" src={webAppUrl + '/images/' + projectId + '/partofeupath.png'}/>
            </a>
          </div>
          <QuickSearch webAppUrl={webAppUrl} searches={quickSearches}/>
          {user && <SmallMenu projectConfig={projectConfig} user={user} onLogin={showLoginForm} onLogout={showLogoutWarning} />}
        </div>
        <a href="/">
          <img alt={"Link to " + projectId + " homepage"} style={{ textAlign: "left" }} src={webAppUrl + "/images/" + projectId + "/title_s.png"}/>
        </a>
        <span style={{
          display: 'inline-block',
          verticalAlign: 'top'
        }}>
          Release {buildNumber}
          <br/>
          {formatReleaseDate(releaseDate)}
        </span>
      </div>
      {/* TODO Put entries into an external JSON file. */}
      <Menu webAppUrl={webAppUrl} showLoginWarning={showLoginWarning} entries={[
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
            url: '/cgi-bin/gbrowse/' + projectId.toLowerCase() // XXX is this correct?
          },
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
          },
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
          {
            id: 'data-files',
            text: 'Data Files',
            url: '/common/downloads'
          },
          {
            id: 'srt',
            text: 'Sequence Retrieval',
            webAppUrl: '/srt.jsp'
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
          },
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
          },
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
        { id: 'analyze', text: 'Analyze My Experiment', route: 'galaxy-orientation', new: true },
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
  );
}

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

function createMenuEntry(searchNode) {
  return {
    id: getId(searchNode),
    text: getDisplayName(searchNode),
    children: searchNode.children.map(createMenuEntry),
    webAppUrl: getTargetType(searchNode) === 'search' &&
      '/showQuestion.do?questionFullName=' + getId(searchNode)
  };
}
