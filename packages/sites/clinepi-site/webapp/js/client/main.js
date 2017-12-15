import 'site/css/ClinEpiSite.css';
import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import studies from './studies';

initialize({
  studies,
  isPartOfEuPathDB: true,
  includeQueryGrid: false,
  mainMenuItems: (props, defaultItems) => [
    defaultItems.home,
    defaultItems.search,
    defaultItems.strategies,
    {
      id: 'studies',
      text: 'Studies',
      route: studies.find(s => s.active).route
    },
    {
      id: 'help',
      text: 'Help',
      url: '#'
    },
    {
      id: 'community',
      text: 'Community',
      children: [
        props.siteConfig.twitterUrl && {
          id: 'twitter',
          text: 'Follow us on Twitter!',
          url: props.siteConfig.twitterUrl,
          target: '_blank'
        },
        props.siteConfig.facebookUrl && {
          id: 'facebook',
          text: 'Follow us on Facebook!',
          url: props.siteConfig.facebookUrl,
          target: '_blank'
        },
        props.siteConfig.youtubeUrl && {
          id: 'youtube',
          text: 'Follow us on YouTube!',
          url: props.siteConfig.youtubeUrl,
          target: '_blank'
        },
        {
          id: 'release-policy',
          text: 'EuPathDB Data Submission & Release Policies',
          url: '/EuPathDB_datasubm_SOP.pdf'
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
      ]
    },
  ],
  smallMenuItems: (props, defaultItems) => [
    {
      text: `About ${props.siteConfig.projectId}`,
      children: [
        {
          text: `What is ${props.siteConfig.projectId}?`,
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About'
        },
        {
          text: 'Publications on EuPathDB sites',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs'
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: `------ Data in ${props.siteConfig.projectId}`
        },
        {
          text: 'Organisms',
          webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes'
        },
        {
          text: `${props.siteConfig.projectId} Gene Metrics`,
          webAppUrl: '/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics'
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: `------ Submitting data to ${props.siteConfig.projectId}`
        },
        {
          text: 'How to submit data to us',
          webAppUrl: '/dataSubmission.jsp'
        },
        {
          text: 'EuPathDB Data Submission & Release Policies',
          url: '/EuPathDB_datasubm_SOP.pdf'
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Usage and Citation'
        },
        {
          text: 'How to cite us',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#citing'
        },
        {
          text: 'Citing Data Providers',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#citingproviders'
        },
        {
          text: 'Publications that Use our Resources',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
        },
        {
          text: 'Data Access Policy',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#use'
        },
        {
          text: 'Website Privacy Policy',
          url: '/documents/EuPathDB_Website_Privacy_Policy.shtml'
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Who are we?'
        },
        {
          text: 'Scientific Working Group',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg'
        },
        {
          text: 'Scientific Advisory Team',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#advisors'
        },
        {
          text: 'Acknowledgements',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks'
        },
        {
          text: 'Funding',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.About#funding'
        },
        {
          text: 'EuPathDB Brochure',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'
        },
        {
          text: 'EuPathDB Brochure in Chinese',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Technical'
        },
        {
          text: 'Accessibility VPAT',
          url: '/documents/EuPathDB_Section_508.pdf'
        },
        {
          text: 'EuPathDB Infrastructure',
          webAppUrl: '/showXmlDataContent.do?name=XmlQuestions.Infrastructure'
        },
        {
          text: 'Website Usage Statistics',
          url: '/awstats/awstats.pl'
        }
      ]
    },
    defaultItems.profileOrLogin,
    defaultItems.registerOrLogout,
    defaultItems.contactUs,
    defaultItems.twitter,
    defaultItems.facebook,
    defaultItems.youtube
  ],
  componentWrappers
});
