import { StudyMenuItem } from 'ebrc-client/App/Studies';
import { menuItemsFromSocials, iconMenuItemsFromSocials } from 'ebrc-client/App/Utils/Utils';
import { getStaticSiteData } from '../selectors/siteData';

export default function headerMenuItems (state) {
  const { siteConfig } = state.globalData;
  const siteData = getStaticSiteData(state);
  const { studies } = siteData;
  const { webAppUrl, facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = menuItemsFromSocials(siteConfig);

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'Search a Study',
        children:[{
            text: 'All Studies',
            appUrl: '/app/search/dataset/Studies/result'
          }].concat(  
          studies.entities != null
          ? studies.entities.map(study => ({ text: <StudyMenuItem study={study} config={siteConfig} /> }))
          : [{ text: <i style={{ fontSize: '13em' }} className="fa fa-align-justify"/> }])
      },
      {
        id: 'workspace',
        text: 'Workspace',
        children: [
          {
            text: 'My Search Strategies',
            appUrl: '/showApplication.do'
          },
          {
            text: 'My Basket',
            appUrl: '/showApplication.do?tab=basket',
            loginRequired: true
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
        children: [
          {
            text: 'About ClinEpiDB',
            route: '/about'
          },
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
            text: 'Tutorials and Resources',
            appUrl: '/showXmlDataContent.do?name=XmlQuestions.Tutorials'
          },
          {
            text: 'Data Access & Use Policy',
            url: '/documents/DataAccessUsePolicyClinEpiDB.latest.pdf'
          },
          ...socialLinks
        ]
      },
      {
        target: '_blank',
        id: 'contactus',
        text: 'Contact Us',
        url: '/a/app/contact-us'
      }
    ],
    iconMenu: [ ...socialIcons ]
  }
};
