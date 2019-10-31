import { get } from 'lodash';

import {
  SHOW_GALAXY_PAGE_PREFERENCE
} from 'ebrc-client/controllers/GalaxyTermsController';

const PlasmoDB = 'PlasmoDB';
const TriTrypDB = 'TriTrypDB';
const CryptoDB = 'CryptoDB';
const ToxoDB = 'ToxoDB';
const FungiDB  = 'FungiDB';
const EuPathDB = 'EuPathDB';
const UD_DISABLED = 'UD_DISABLED';

/**
 * Determine if galaxy orientation page should be shown.
 *
 * @return {boolean}
 */
function shouldShowGalaxyOrientation(preferences) {
  return get(preferences, ['global', SHOW_GALAXY_PAGE_PREFERENCE], 'true') === 'true';
}


/**
 * Get menu items
 *
 * @return {Array<Item>}
 */
export default function mainMenuItems({ siteConfig, config, preferences }, defaultItems) {
  const userDatasetsEnabled = get(config, ['userDatasetStoreStatus'], UD_DISABLED) !== UD_DISABLED;
  return [
    defaultItems.home,
    defaultItems.search,
    defaultItems.strategies,
    defaultItems.basket,

    userDatasetsEnabled ? {
      id: 'userDatasets',
      text: 'My Data Sets',
      beta: true,
      exclude: [EuPathDB],
      route: '/workspace/datasets'
    } : null,

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
          //beta: true
        },
        {
          id: 'srt',
          text: 'Sequence Retrieval',
          webAppUrl: '/srt.jsp'
        },
        {
          id: 'galaxy',
          text: 'Analyze My Experiment',
          webAppUrl: '/app/galaxy-orientation'
        },
        // {
        //   id: 'pathogen-portal',
        //   text: 'Pathogen Portal',
        //   url: 'http://rnaseq.pathogenportal.org'
        // },
        {
          id: 'companion_fungi',
          text: 'Companion',
          exclude: [FungiDB],
          tooltip: 'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'http://companion.gla.ac.uk/',
          target: '_blank'
        },
        {
          id: 'companion',
          text: 'Companion',
          include: [FungiDB],
          tooltip: 'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'http://fungicompanion.gla.ac.uk/',
          target: '_blank'
        },
        {
          id: 'LeishGEdit',
          text: 'LeishGEdit',
          include: [TriTrypDB],
          tooltip: 'Your online resource for CRISPR Cas9 T7 RNA Polymerase gene editing in kinetoplastids',
          url: 'http://www.leishgedit.net',
          target: '_blank'
        },
        {
          id: 'EuPaGDT',
          text: 'EuPaGDT',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'http://grna.ctegd.uga.edu',
          target: '_blank'
        },
        {
          id: 'pubcrawler',
          text: 'PubMed and Entrez',
          url: '/pubcrawler/' + siteConfig.projectId
        },
        {
          id: 'jbrowse',
          text: 'Genome Browser',
          exclude: [EuPathDB],
          url: '/a/jbrowse.jsp?data=/a/service/jbrowse/tracks/default&tracks=gene'
        },
        {
          id: 'plasmoap',
          text: 'PlasmoAP',
          include: [PlasmoDB],
          webAppUrl: '/plasmoap.jsp'
        },
        {
          id: 'pats',
          text: 'PATS',
          include: [PlasmoDB],
          url: 'http://modlabcadd.ethz.ch/software/pats/',
          target: '_blank'
        },
	/*        {
          id: 'plasmit',
          text: 'PlasMit',
          include: [PlasmoDB],
          url: 'http://gecco.org.chemie.uni-frankfurt.de/plasmit'
	  },*/
        {
          id: 'ancillary-genome-browser',
          text: 'Ancillary Genome Browser',
          include: [ToxoDB],
          url: 'http://ancillary.toxodb.org',
          target: '_blank'
        },
        {
          id: 'webservices',
          text: 'Searches via Web Services',
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
          route: '/search/dataset/AllDatasets/result'
        },
        {
          id: 'analysis-methods',
          text: 'Analysis Methods',
          webAppUrl: '/wdkCustomization/jsp/questions/XmlQuestions.Methods.jsp'
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
          webAppUrl: '/wdkCustomization/jsp/questions/XmlQuestions.AboutAll.jsp#downloads'
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
          webAppUrl: '/wdkCustomization/jsp/questions/XmlQuestions.EuPathDBPubs.jsp'
        },
        {
          id: 'mahpic-data',
          text: 'MaHPIC Data',
          include: [PlasmoDB],
          tooltip: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp'
        }
      ]
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        siteConfig.twitterUrl && {
          id: 'twitter',
          text: 'Follow us on Twitter!',
          url: siteConfig.twitterUrl,
          target: '_blank'
        },
        siteConfig.facebookUrl && {
          id: 'facebook',
          text: 'Follow us on Facebook!',
          url: siteConfig.facebookUrl,
          target: '_blank'
        },
        siteConfig.youtubeUrl && {
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
//        {
//          id: 'events',
//          text: 'Upcoming Events',
//          webAppUrl: '/communityEvents.jsp'
//        },
        {
          id: 'related-sites',
          text: 'Related Sites',
          webAppUrl: '/wdkCustomization/jsp/questions/XmlQuestions.ExternalLinks.jsp'
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
          tooltip: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp'
        }
      ]
    },

    {
      id: 'analyze',
      text: 'Analyze My Experiment',
/*      new: true, */
      route: shouldShowGalaxyOrientation(preferences) ? '/galaxy-orientation' : undefined,
      url: !shouldShowGalaxyOrientation(preferences) ? 'https://eupathdb.globusgenomics.org/' : undefined,
      target: !shouldShowGalaxyOrientation(preferences) ? '_blank' : undefined
    },

    defaultItems.favorites
  ];
}
