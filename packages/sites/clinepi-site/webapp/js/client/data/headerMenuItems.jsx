import React from 'react';
import { StudyMenuItem } from '@veupathdb/web-common/lib/App/Studies';
import { menuItemsFromSocials, iconMenuItemsFromSocials } from '@veupathdb/web-common/lib/App/Utils/Utils';
import { getStaticSiteData } from '../selectors/siteData';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';
import { withPermissions } from '@veupathdb/web-common/lib/components/Permissions';

const ClinEpiStudyMenuItem = withPermissions(StudyMenuItem);

export default function headerMenuItems (state) {
  const { siteConfig } = state.globalData;
  const siteData = getStaticSiteData(state);
  const { studies } = siteData;
  const { youtubeUrl } = siteConfig;
  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = menuItemsFromSocials(siteConfig);

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'Search a Study',
        children:[{
            text: <div style={{ padding: '0.5em 0' }}>All Studies</div>,
            route: '/search/dataset/Studies/result'
          }].concat(  
          studies.entities != null
          ? studies.entities.map(study => ({ text: <ClinEpiStudyMenuItem study={study} config={siteConfig} /> }))
          : [{ text: <i style={{ fontSize: '13em' }} className="fa fa-align-justify"/> }])
      },
      {
        id: 'workspace',
        text: 'Workspace',
        children: [
          {
            text: 'My Search Strategies',
            route: '/workspace/strategies'
          },
          {
            text: 'My Basket',
            route: '/workspace/basket',
            loginRequired: true
          },
          {
            text: 'Public Search Strategies',
            route: '/workspace/strategies/public'
          }
        ]
      },
      {
        id: 'about',
        text: 'About',
        children: [
          {
            text: 'About ClinEpiDB',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/about.html`
          },
          {
            text: 'News',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/news.html`
          },
          { 
            text: 'FAQ',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/faq.html`
          },
          {
            text: 'Tutorials and Resources',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/resources.html`
          },
          { 
            text: 'Workshops',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/workshops.html`
          },
          {
            text: 'Public Strategies',
            route: '/workspace/strategies/public'
          },
          {
            text: 'Data Access & Use Policy',
            route: `${STATIC_ROUTE_PATH}/ClinEpiDB/access_and_use.html`
          },
          ...socialLinks
        ]
      },
      {
        target: '_blank',
        id: 'contactus',
        text: 'Contact Us',
        route: '/contact-us'
      }
    ],
    iconMenu: [ ...socialIcons ]
  }
};
