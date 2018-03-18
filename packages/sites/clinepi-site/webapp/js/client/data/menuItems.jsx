import studies from './studies.json';

import { StudyMenuItem } from 'Client/App/Studies';
import { menuItemsFromSocials, iconMenuItemsFromSocials } from 'Client/App/Utils/Utils';

export default function menuItems (siteConfig) {
  const { webAppUrl, facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = menuItemsFromSocials(siteConfig);

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'Search a Study',
        children: studies.map(study => ({ text: <StudyMenuItem study={study} config={siteConfig} /> }))
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
          {
            text: 'Video Tutorials',
            url: youtubeUrl,
            target: '_blank'
          },
          {
            text: 'PDF Tutorial',
            url: 'https://drive.google.com/open?id=1T5-Bl1d6nQXDpCSIXwDmNcoO8GGyoMEE',
            target: '_blank'
          },
          {
            text: 'Data Access & Use Policy',
            url: '/documents/CE_DataAccessUsePolicy_Rev2.pdf'
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
