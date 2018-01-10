import studies from './studies.json';
import {
  ucFirst,
  menuItemsFromStudies,
  iconMenuItemsFromSocials,
  injectStudyWebappUrl,
  addWebAppUrlToStudies
} from 'Client/App/Studies/StudyUtils';

export default function menuItems (siteConfig) {
  const { webAppUrl, facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const studyLinks = menuItemsFromStudies(studies, webAppUrl);

  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = ['facebook', 'twitter', 'youtube']
    .filter(siteName => `${siteName}Url` in siteConfig)
    .map(siteName => ({ text: `${ucFirst(siteName)}`, url: siteConfig[`${siteName}Url`] }))

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'Studies',
        children: studyLinks
      },
      {
        id: 'workspace',
        text: 'Workspace',
        appUrl: '/showApplication.do',
        children: [
          {
            text: 'My Search Strategies',
            appUrl: '/showApplication.do?tab=search_history'
          },
          {
            text: 'Public Search Strategies',
            appUrl: '/showApplication.do?tab=public_strat'
          }
        ]
      },
      /*
      {
        id: 'about',
        text: 'About',
        children: ({ projectId }) => ([
          {
            text: 'Publications that Use our Resources',
            target: '_blank',
            url: 'http://scholar.google.com/scholar?as_q=&num=10&as_epq=&as_oq=ClinEpiDB+OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&as_eq=encrypt+cryptography+hymenoptera&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_sdt=1.&as_sdtp=on&as_sdtf=&as_sdts=39&btnG=Search+Scholar&hl=en'
          },
          {
            text: 'Website Privacy Policy',
            target: '_blank',
            url: '/documents/EuPathDB_Website_Privacy_Policy.shtml'
          },
          {
            text: 'EuPathDB Brochure',
            target: '_blank',
            url: 'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'
          },
          {
            text: 'EuPathDB Brochure in Chinese',
            target: '_blank',
            url: 'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'
          },
          {
            text: 'Accessibility VPAT',
            target: '_blank',
            url: '/documents/EuPathDB_Section_508.pdf'
          },
          {
            text: 'Website Usage Statistics',
            target: '_blank',
            url: '/awstats/awstats.pl'
          }
        ])
      },
      */
      {
        id: 'community',
        text: 'Community',
        children: [,
          {
            text: 'News',
            appUrl: '/showXmlDataContent.do?name=XmlQuestions.News'
          },
          {
            text: 'Public Strategies',
            appUrl: '/showApplication.do?tab=public_strat'
          },
          ...socialLinks
        ]
      },
      {
        target: '_blank',
        id: 'contactus',
        text: 'Contact Us',
        appUrl: '/contact.do'
      }
    ],
    iconMenu: [ ...socialIcons ]
  }
};
