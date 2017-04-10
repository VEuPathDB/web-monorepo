import {
  find,
  get,
  negate,
  takeWhile
} from 'lodash';

import {
  SHOW_GALAXY_PAGE_PREFERENCE
} from './components/controllers/GalaxyTermsController';

const PlasmoDB = 'PlasmoDB';
const CryptoDB = 'CryptoDB';
const ToxoDB = 'ToxoDB';
const EuPathDB = 'EuPathDB';

/**
 * Determine if galaxy orientation page should be shown.
 *
 * @return {boolean}
 */
function shouldShowGalaxyOrientation(preferences) {
  return get(preferences, SHOW_GALAXY_PAGE_PREFERENCE, 'true') === 'true';
}

/**
 * Is Entry favorites link?
 *
 * @return {boolean}
 */
function isFavorites(entry) {
  return entry.id === 'favorites';
}

/**
 * Get subset of defaultEntries we want to show in menu.
 *
 * @return {Array<Entry>}
 */
function getInitialEntries(defaultEntries) {
  return takeWhile(defaultEntries, negate(isFavorites));
}

/**
 * Get favorites link menu entry
 *
 * @return {Entry}
 */
function findFavoritesEntry(defaultEntries) {
  return find(defaultEntries, isFavorites);
}

/**
 * Get menu entries
 *
 * @return {Array<Entry>}
 */
export default function menuItems({ siteConfig, preferences }, defaultEntries) {
  return getInitialEntries(defaultEntries).concat([
    {
      id: 'tools',
      text: 'Tools',
      children: [
        {
          id: 'blast',
          text: 'BLAST',
          webAppUrl: '/showQuestion.do?questionFullName=UniversalQuestions.UnifiedBlast'
        },
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
          exclude: [EuPathDB],
          url: '/cgi-bin/gbrowse/' + siteConfig.projectId.toLowerCase()
        },
        {
          id: 'plasmoap',
          text: 'PlasmoAP',
          include: [PlasmoDB],
          url: 'http://v4-4.plasmodb.org/restricted/PlasmoAPcgi.shtml'
        },
        {
          id: 'pats',
          text: 'PATS',
          include: [PlasmoDB],
          url: 'http://gecco.org.chemie.uni-frankfurt.de/pats/pats-index.php'
        },
        {
          id: 'plasmit',
          text: 'PlasMit',
          include: [PlasmoDB],
          url: 'http://gecco.org.chemie.uni-frankfurt.de/plasmit'
        },
        {
          id: 'ancillary-genome-browser',
          text: 'Ancillary Genome Browser',
          include: [ToxoDB],
          url: 'http://ancillary.toxodb.org'
        },
        {
          id: 'webservices',
          text: 'Searched via Web Services',
          webAppUrl: '/serviceList.jsp'
        }
      ]
    },
    {
      id: 'data-summary',
      text: 'Data Summary',
      children: [
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
          id: 'annotation-sops',
          text: 'SOPs for <i>C.parvum</i> Annotation',
          include: [CryptoDB],
          url: 'http://cryptodb.org/static/SOP/'
        },
        {
          id: 'genomes-and-data-types',
          text: 'Genomes and Data Types',
          webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes',
          tooltip: 'Table summarizing all the genomes and their different data types available in ' + siteConfig.projectId
        },
        {
          id: 'gene-metrics',
          text: 'Gene Metrics',
          tooltip: 'Table summarizing gene counts for all the available genomes, and evidence supporting them',
          webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics'
        }
      ]
    },
    {
      id: 'downloads',
      text: 'Downloads',
      children: [
        {
          id: 'about-downloads',
          text: 'Understanding Downloads',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#downloads'
        },
        {
          id: 'data-files-eupathdb',
          text: 'Data Files',
          exclude: [EuPathDB],
          url: '/common/downloads'
        },
        {
          id: 'data-files',
          text: 'Data Files',
          include: [EuPathDB],
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
        },
        {
          id: 'srt',
          text: 'Sequence Retrieval',
          webAppUrl: '/srt.jsp'
        },
        {
          id: 'community-upload',
          text: 'Upload Community Files',
          exclude: [EuPathDB],
          webAppUrl: '/communityUpload.jsp'
        },
        {
          id: 'community-download',
          text: 'Download Community Files',
          exclude: [EuPathDB],
          webAppUrl: '/processQuestion.do?questionFullName=UserFileQuestions.UserFileUploads'
        },
        {
          id: 'eupathdb-publications',
          text: 'EuPathDB Publications',
          include: [EuPathDB],
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs'
        },
        {
          id: 'mahpic-data',
          text: 'MaHPIC Data',
          include: [PlasmoDB],
          tooltop: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp'
        }
      ]
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        {
          id: 'twitter',
          text: 'Follow us on Twitter!',
          url: siteConfig.twitterUrl,
          target: '_blank'
        },
        {
          id: 'facebook',
          text: 'Follow us on Facebook!',
          url: siteConfig.facebookUrl,
          target: '_blank'
        },
        {
          id: 'youtube',
          text: 'Follow us on YouTube!',
          url: siteConfig.youtubeUrl,
          target: '_blank'
        },
        {
          id: 'release-policy',
          text: 'EuPathDB Data Submission & Release Policies',
          url: '/EuPathDB_datasubm_SOP.pdf'
        },
        {
          id: 'comments',
          text: 'Find Genes with Comments from the ' + siteConfig.projectId + ' Community',
          exclude: [EuPathDB],
          tooltip: 'Add your comments to your gene of interest: start at the gene page',
          webAppUrl: '/showSummary.do?questionFullName=GeneQuestions.GenesWithUserComments&value(timestamp)=817205'
        },
        {
          id: 'community-upload',
          text: 'Upload Community Files',
          exclude: [EuPathDB],
          webAppUrl: '/communityUpload.jsp'
        },
        {
          id: 'community-download',
          text: 'Download Community Files',
          exclude: [EuPathDB],
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
        },
        {
          id: 'mahpic-data',
          text: 'MaHPIC Data',
          include: [PlasmoDB],
          tooltop: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp'
        }
      ]
    },
    {
      id: 'analyze',
      text: 'Analyze My Experiment',
      new: true,
      route: shouldShowGalaxyOrientation(preferences) ? 'galaxy-orientation' : undefined,
      url: !shouldShowGalaxyOrientation(preferences) ? 'https://eupathdb.globusgenomics.org/' : undefined,
      target: !shouldShowGalaxyOrientation(preferences) ? '_blank' : undefined
    },
    findFavoritesEntry(defaultEntries)
  ]);
}
