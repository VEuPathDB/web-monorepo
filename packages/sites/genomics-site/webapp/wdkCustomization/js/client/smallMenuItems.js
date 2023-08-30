/**
 * Get small menu entries
 * @return {Array<Entry>}
 */
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';

export default function smallMenuEntries(
  { siteConfig: { projectId } },
  defaultEntries
) {
  const aboutRoute = `${STATIC_ROUTE_PATH}/${projectId}/about.html`;
  const aboutAllRoute = `${STATIC_ROUTE_PATH}/embedded/help/general/index.html`;
  return [
    {
      text: `About ${projectId}`,
      children: [
        {
          text: `What is ${projectId}?`,
          route: aboutRoute,
        },
        {
          text: 'Publications on EuPathDB sites',
          route: `${STATIC_ROUTE_PATH}/veupathPubs.html`,
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: `------ Data in ${projectId}`,
        },
        {
          text: 'Organisms',
          route: '/search/organism/GenomeDataTypes/result',
        },
        {
          text: `${projectId} Gene Metrics`,
          route: '/search/organism/GeneMetrics/result',
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: `------ Submitting data to ${projectId}`,
        },
        {
          text: 'How to submit data to us',
          webAppUrl: '/dataSubmission.jsp',
        },
        {
          text: 'EuPathDB Data Submission & Release Policies',
          url: '/EuPathDB_datasubm_SOP.pdf',
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Usage and Citation',
        },
        {
          text: 'How to cite us',
          route: `${aboutRoute}#citing`,
        },
        {
          text: 'Citing Data Providers',
          route: `${aboutRoute}#citingproviders`,
        },
        {
          text: 'Publications that Use our Resources',
          url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en',
        },
        {
          text: 'Data Access Policy',
          route: `${aboutRoute}#use`,
        },
        {
          text: 'Website Privacy Policy',
          url: '/documents/EuPathDB_Website_Privacy_Policy.shtml',
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Who are we?',
        },
        {
          text: 'Scientific Working Group',
          route: `${aboutAllRoute}#swg`,
        },
        {
          text: 'Scientific Advisory Team',
          route: `${aboutRoute}#advisors`,
        },
        {
          text: 'Acknowledgements',
          route: `${aboutAllRoute}#acks`,
        },
        {
          text: 'Funding',
          route: `${aboutRoute}#funding`,
        },
        {
          text: 'EuPathDB Brochure',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf',
        },
        {
          text: 'EuPathDB Brochure in Chinese',
          url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf',
        },
        {
          liClassName: 'eupathdb-SmallMenuDivider',
          text: '------ Technical',
        },
        {
          text: 'Accessibility VPAT',
          url: '/documents/EuPathDB_Section_508.pdf',
        },
        {
          text: 'EuPathDB Infrastructure',
          route: `${STATIC_ROUTE_PATH}/infrastructure.html`,
        },
        {
          text: 'Website Usage Statistics',
          url: '/awstats/awstats.pl',
        },
      ],
    },
    {
      text: 'Help',
      children: [
        {
          text: `Reset ${projectId} Session`,
          webAppUrl: '/resetSession.jsp',
          title: 'Login first to keep your work.',
        },
        {
          text: 'YouTube Tutorials Channel',
          url: 'http://www.youtube.com/user/EuPathDB/videos?sort=dd&flow=list&view=1',
        },
        {
          text: 'Web Tutorials',
          route: `${STATIC_ROUTE_PATH}/tutorials.html`,
        },
        {
          text: 'EuPathDB Workshop',
          url: 'http://workshop.eupathdb.org/current/',
        },
        {
          text: 'Exercises from Workshop',
          url: 'http://workshop.eupathdb.org/current/index.php?page=schedule',
        },
        {
          text: `NCBI's Glossary of Terms`,
          url: 'http://www.genome.gov/Glossary/',
        },
        {
          text: `Our Glossary`,
          route: `${STATIC_ROUTE_PATH}/glossary.html`,
        },
        {
          text: 'Contact Us',
          route: '/contact-us',
          target: '_blank',
        },
      ],
    },
    defaultEntries.profileOrLogin,
    defaultEntries.registerOrLogout,
    defaultEntries.contactUs,
    defaultEntries.twitter,
    defaultEntries.facebook,
    defaultEntries.youtube,
  ];
}
