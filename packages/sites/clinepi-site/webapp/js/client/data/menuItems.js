import studies from './studies.json';
import { menuItemsFromStudies, iconMenuItemsFromSocials, injectStudyWebappUrl, addWebAppUrlToStudies } from 'Client/App/Studies/StudyUtils';

export default function menuItems (siteConfig) {
  const { webAppUrl } = siteConfig;
  const localStudies = addWebAppUrlToStudies(studies, webAppUrl);
  const socialIcons = iconMenuItemsFromSocials(siteConfig);

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'New Search',
        children: () => menuItemsFromStudies(localStudies)
      },
      {
        id: 'strategies',
        text: 'My Strategies',
        appUrl: '/showApplication.do'
      },
      {
        id: 'studies',
        text: 'Studies',
        appUrl: '/app/record/dataset/DS_841a9f5259'
      },
      {
        id: 'about',
        text: 'About',
        children: ({ projectId }) => ([
          {
            className: 'division',
            target: '_blank',
            text: 'Usage and Citation'
          },
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
            className: 'division',
            target: '_blank',
            text: 'Who are we?'
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
            className: 'division',
            target: '_blank',
            text: 'Technical'
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
      {
        id: 'community',
        text: 'Community',
        children: [
          {
            text: 'Public Strategies',
            appUrl: '/showApplication.do?tab=public_strat'
          }
        ]
      },
      {
        target: '_blank',
        id: 'contactus',
        text: 'Contact Us',
        url: webAppUrl + '/contact.do'
      }
    ],
    iconMenu: [ ...socialIcons ]
  }
};
