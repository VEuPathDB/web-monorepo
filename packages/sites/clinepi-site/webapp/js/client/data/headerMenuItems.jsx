import React, { useEffect } from 'react';
import { StudyMenuItem, StudyMenuSearch } from '@veupathdb/web-common/lib/App/Studies';
import { menuItemsFromSocials, iconMenuItemsFromSocials } from '@veupathdb/web-common/lib/App/Utils/Utils';
import { getStaticSiteData } from '../selectors/siteData';
import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';
import { STATIC_ROUTE_PATH, makeEdaRoute } from '@veupathdb/web-common/lib/routes';

export default function makeHeaderMenuItemsFactory(permissionsValue, diyDatasets, reloadDiyDatasets) {
  return function makeHeaderMenuItems(state, props) {
    const { siteConfig } = state.globalData;
    const siteData = getStaticSiteData(state);
    const { studies } = siteData;
    const { youtubeUrl } = siteConfig;
    const socialIcons = iconMenuItemsFromSocials(siteConfig);
    const socialLinks = menuItemsFromSocials(siteConfig);
    const searchTerm = props.searchTerm;
    const setSearchTerm = props.setSearchTerm;

    const studyTableIconStyle = {
      fontSize: '1.4em',
      marginRight: '.25em',
      position: 'relative',
      bottom: '-.25em'
    }

    return {
      mainMenu: [
        {
          id: 'studies',
          text: 'Studies',
          children:[
            {
              text: (
                <div style={{ padding: '0.5em 0' }}>
                  <i className="ebrc-icon-table" style={studyTableIconStyle}></i> Study summaries table
                </div>
              ),
              route: '/search/dataset/Studies/result'
            },
            {
              text: <StudyMenuSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm}/>
            }
          ].concat(
            studies.entities != null && !permissionsValue.loading
            ? studies.entities
                .filter(
                  study => (
                    study.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                ).map(
                  study => ({
                    text: <StudyMenuItem study={study} config={siteConfig} permissions={permissionsValue.permissions} />
                  })
                )
            : [{ text: <i style={{ fontSize: '13em' }} className="fa fa-align-justify"/> }])
        },
        {
          id: 'workspace',
          text: 'Workspace',
          children: [
            {
              text: 'My Analyses',
              route: makeEdaRoute()
            },
            ...(
              useUserDatasetsWorkspace
                ? [
                    {
                      text: 'My Studies',
                      route: '/workspace/datasets'
                    }
                  ]
                : []
            ),
            {
              text: 'Public Analyses',
              route: `${makeEdaRoute()}/public`
            }
          ]
        },
        {
          id: 'help',
          text: 'Help',
          children: [
            {
              text: 'Tutorials',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/tutorials.html`
            },
            {
              text: 'Webinars',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/webinars.html`
            },
            {
              text: 'Workshops',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/workshops.html`
            },
            {
              text: 'External Resources',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/resources.html`
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
              text: 'Features coming soon',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/newfeatures.html`
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
              text: 'Data Access & Use Policy',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/access_and_use.html`
            },
            {
              text: 'Publications about ClinEpiDB',
              url: 'https://gatesopenresearch.org/articles/3-1661',
              target: '_blank'
            },
            {
              text: 'Publications that use our resource',
              url: 'https://scholar.google.com/scholar?hl=en&q=ClinEpiDB',
              target: '_blank'
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
}

/**
 * Effectful component which reloads DIY studies whenever "focused"
 */
function DiyStudiesDaemon(props) {
  useEffect(() => {
    if (props.isFocused) {
      props.reloadDiyDatasets();
    }
  }, [props.isFocused, props.reloadDiyDatasets]);

  return null;
}
