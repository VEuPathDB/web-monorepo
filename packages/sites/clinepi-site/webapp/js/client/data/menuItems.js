import studies from './studies.json';
import { menuItemsFromStudies } from 'Client/App/Studies/StudyUtils';

import { ucFirst, menuItemsFromSocials, iconMenuItemsFromSocials } from 'Client/App/Utils/Utils';

export default function menuItems (siteConfig) {
  const { webAppUrl, facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const studyLinks = menuItemsFromStudies(studies, webAppUrl);

  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = menuItemsFromSocials(siteConfig);

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
