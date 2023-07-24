import { get } from 'lodash';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';
import { SHOW_GALAXY_PAGE_PREFERENCE } from '@veupathdb/web-common/lib/controllers/GalaxyTermsController';

const PlasmoDB = 'PlasmoDB';
const TriTrypDB = 'TriTrypDB';
const CryptoDB = 'CryptoDB';
const ToxoDB = 'ToxoDB';
const FungiDB = 'FungiDB';
const EuPathDB = 'EuPathDB';
const UD_DISABLED = 'UD_DISABLED';

/**
 * Determine if galaxy orientation page should be shown.
 *
 * @return {boolean}
 */
function shouldShowGalaxyOrientation(preferences) {
  return (
    get(preferences, ['global', SHOW_GALAXY_PAGE_PREFERENCE], 'true') === 'true'
  );
}

/**
 * Get menu items
 *
 * @return {Array<Item>}
 */
export default function mainMenuItems(
  { siteConfig, config, preferences },
  defaultItems
) {
  return [
    defaultItems.home,
    defaultItems.search,
    defaultItems.strategies,
    defaultItems.basket,

    {
      id: 'tools',
      text: 'Tools',
      children: [
        {
          id: 'blast',
          text: 'BLAST',
          route: '/search/transcript/UnifiedBlast',
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
          webAppUrl: '/srt.jsp',
        },
        {
          id: 'galaxy',
          text: 'Analyze My Experiment',
          route: '/galaxy-orientation',
        },
        // {
        //   id: 'pathogen-portal',
        //   text: 'Pathogen Portal',
        //   url: 'http://rnaseq.pathogenportal.org'
        // },
        {
          id: 'companion',
          text: 'Companion',
          exclude: [HostDB],
          tooltip:
            'Annotate your sequence and determine orthology, phylogeny & synteny',
          url: 'https://companion.ac.uk/',
          target: '_blank',
        },
        {
          id: 'LeishGEdit',
          text: 'LeishGEdit',
          include: [TriTrypDB],
          tooltip:
            'Your online resource for CRISPR Cas9 T7 RNA Polymerase gene editing in kinetoplastids',
          url: 'http://www.leishgedit.net',
          target: '_blank',
        },
        {
          id: 'EuPaGDT',
          text: 'EuPaGDT',
          tooltip: 'Eukaryotic Pathogen CRISPR guide RNA/DNA Design Tool',
          url: 'http://grna.ctegd.uga.edu',
          target: '_blank',
        },
        {
          id: 'pubcrawler',
          text: 'PubMed and Entrez',
          url: '/pubcrawler/' + siteConfig.projectId,
        },
        {
          id: 'jbrowse',
          text: 'Genome Browser',
          exclude: [EuPathDB],
          route: '/jbrowse?data=/a/service/jbrowse/tracks/default&tracks=gene',
        },
        {
          id: 'plasmoap',
          text: 'PlasmoAP',
          include: [PlasmoDB],
          webAppUrl: '/plasmoap.jsp',
        },
        {
          id: 'pats',
          text: 'PATS',
          include: [PlasmoDB],
          url: 'http://modlabcadd.ethz.ch/software/pats/',
          target: '_blank',
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
          target: '_blank',
        },
        {
          id: 'webservices',
          text: 'Searches via Web Services',
          url: '/documents/WebServicesURLBuilderHELPPAGE.pdf',
        },
      ],
    },
    {
      id: 'data-summary',
      text: 'Data Summary',
      children: [
        {
          id: 'datasets',
          text: 'Data Sets',
          route: '/search/dataset/AllDatasets/result',
        },
        {
          id: 'analysis-methods',
          text: 'Analysis Methods',
          route: `${STATIC_ROUTE_PATH}/methods.html`,
        },
        {
          id: 'annotation-sops',
          text: 'SOPs for <i>C.parvum</i> Annotation',
          include: [CryptoDB],
          url: 'http://cryptodb.org/static/SOP/',
        },
        {
          id: 'genomes-and-data-types',
          text: 'Genomes and Data Types',
          route: '/search/organism/GenomeDataTypes/result',
          tooltip:
            'Table summarizing all the genomes and their different data types available in ' +
            siteConfig.projectId,
        },
        {
          id: 'gene-metrics',
          text: 'Gene Metrics',
          tooltip:
            'Table summarizing gene counts for all the available genomes, and evidence supporting them',
          route: '/search/organism/GeneMetrics/result',
        },
      ],
    },

    {
      id: 'downloads',
      text: 'Downloads',
      children: [
        {
          id: 'about-downloads',
          text: 'Understanding Downloads',
          route: `${STATIC_ROUTE_PATH}/embedded/help/general/index.html#downloads`,
        },
        {
          id: 'data-files-eupathdb',
          text: 'Data Files',
          exclude: [EuPathDB],
          url: '/common/downloads',
        },
        {
          id: 'data-files',
          text: 'Data Files',
          include: [EuPathDB],
          children: [
            {
              id: 'AmoebaDB',
              text: 'AmoebaDB',
              url: 'http://amoebadb.org/common/downloads',
            },
            {
              id: 'CryptoDB',
              text: 'CryptoDB',
              url: 'http://cryptodb.org/common/downloads',
            },
            {
              id: 'FungiDB',
              text: 'FungiDB',
              url: 'http://fungidb.org/common/downloads',
            },
            {
              id: 'GiardiaDB',
              text: 'GiardiaDB',
              url: 'http://giardiadb.org/common/downloads',
            },
            {
              id: 'MicrosporidiaDB',
              text: 'MicrosporidiaDB',
              url: 'http://microsporidiadb.org/common/downloads',
            },
            {
              id: 'PiroplasmaDB',
              text: 'PiroplasmaDB',
              url: 'http://piroplasmadb.org/common/downloads',
            },
            {
              id: 'PlasmoDB',
              text: 'PlasmoDB',
              url: 'http://plasmodb.org/common/downloads',
            },
            {
              id: 'ToxoDB',
              text: 'ToxoDB',
              url: 'http://toxodb.org/common/downloads',
            },
            {
              id: 'TrichDB',
              text: 'TrichDB',
              url: 'http://trichdb.org/common/downloads',
            },
            {
              id: 'TriTrypDB',
              text: 'TriTrypDB',
              url: 'http://tritrypdb.org/common/downloads',
            },
          ],
        },
        {
          id: 'srt',
          text: 'Sequence Retrieval',
          webAppUrl: '/srt.jsp',
        },
        // {
        //   id: 'community-upload',
        //   text: 'Upload Community Files',
        //   exclude: [EuPathDB],
        //   webAppUrl: '/communityUpload.jsp'
        // },
        {
          id: 'community-download',
          text: 'Download Community Files',
          exclude: [EuPathDB],
          route: '/search/file/UserFileUploads/result',
        },
        {
          id: 'eupathdb-publications',
          text: 'EuPathDB Publications',
          route: `${STATIC_ROUTE_PATH}/veupathPubs.html`,
        },
        {
          id: 'mahpic-data',
          text: 'MaHPIC Data',
          include: [PlasmoDB],
          tooltip: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp',
        },
      ],
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        siteConfig.twitterUrl && {
          id: 'twitter',
          text: 'Follow us on Twitter!',
          url: siteConfig.twitterUrl,
          target: '_blank',
        },
        siteConfig.facebookUrl && {
          id: 'facebook',
          text: 'Follow us on Facebook!',
          url: siteConfig.facebookUrl,
          target: '_blank',
        },
        siteConfig.youtubeUrl && {
          id: 'youtube',
          text: 'Follow us on YouTube!',
          url: siteConfig.youtubeUrl,
          target: '_blank',
        },
        {
          id: 'release-policy',
          text: 'EuPathDB Data Submission & Release Policies',
          url: '/EuPathDB_datasubm_SOP.pdf',
        },
        {
          id: 'comments',
          text:
            'Find Genes with Comments from the ' +
            siteConfig.projectId +
            ' Community',
          exclude: [EuPathDB],
          tooltip:
            'Add your comments to your gene of interest: start at the gene page',
          route: '/search/gene/GenesWithUserComments',
        },
        //{
        //  id: 'community-upload',
        //  text: 'Upload Community Files',
        //  exclude: [EuPathDB],
        //  webAppUrl: '/communityUpload.jsp'
        //},
        {
          id: 'community-download',
          text: 'Download Community Files',
          exclude: [EuPathDB],
          route: '/search/file/UserFileUploads/result',
        },
        //        {
        //          id: 'events',
        //          text: 'Upcoming Events',
        //          webAppUrl: '/communityEvents.jsp'
        //        },
        {
          id: 'related-sites',
          text: 'Related Sites',
          route: `${STATIC_ROUTE_PATH}/${siteConfig.projectId}/externalLinks.html`,
        },
        {
          id: 'public-strategies',
          text: 'Public Strategies',
          route: '/workspace/strategies/public',
        },
        {
          id: 'mahpic-data',
          text: 'MaHPIC Data',
          include: [PlasmoDB],
          tooltip: 'Access MaHPIC Data',
          webAppUrl: '/mahpic.jsp',
        },
      ],
    },

    {
      id: 'analyze',
      text: 'Analyze My Experiment',
      /*      new: true, */
      route: shouldShowGalaxyOrientation(preferences)
        ? '/galaxy-orientation'
        : undefined,
      url: !shouldShowGalaxyOrientation(preferences)
        ? 'https://eupathdb.globusgenomics.org/'
        : undefined,
      target: !shouldShowGalaxyOrientation(preferences) ? '_blank' : undefined,
    },

    defaultItems.favorites,
  ];
}
