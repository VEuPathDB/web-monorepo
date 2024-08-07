import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  StudyMenuItem,
  StudyMenuSearch,
} from '@veupathdb/web-common/lib/App/Studies';
import { DIYStudyMenuItem } from '@veupathdb/web-common/lib/App/Studies/DIYStudyMenuItem';
import { CollapsibleDetailsSection } from '@veupathdb/wdk-client/lib/Components';
import {
  menuItemsFromSocials,
  iconMenuItemsFromSocials,
} from '@veupathdb/web-common/lib/App/Utils/Utils';
import { getStaticSiteData } from '../selectors/siteData';
import {
  requireLogin,
  useEda,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';
import {
  STATIC_ROUTE_PATH,
  makeEdaRoute,
} from '@veupathdb/web-common/lib/routes';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
// @ts-ignore
import betaImage from '@veupathdb/wdk-client/lib/Core/Style/images/beta2-30.png';

export default function makeHeaderMenuItemsFactory(
  permissionsValue,
  diyDatasets,
  communityDatasets,
  reloadDiyDatasets,
  expandUserStudies,
  setExpandUserStudies,
  expandCommunityStudies,
  setExpandCommunityStudies,
  expandCuratedStudies,
  setExpandCuratedStudies
) {
  return function makeHeaderMenuItems(state, props) {
    const { siteConfig } = state.globalData;
    const siteData = getStaticSiteData(state);
    const { studies } = siteData;
    const socialIcons = iconMenuItemsFromSocials(siteConfig);
    const socialLinks = menuItemsFromSocials(siteConfig);
    const searchTerm = props.searchTerm;
    const setSearchTerm = props.setSearchTerm;

    const studyTableIconStyle = {
      fontSize: '1.4em',
      marginRight: '.25em',
      position: 'relative',
      bottom: '-.25em',
    };

    const submenuStyle = {
      color: 'black',
      fontWeight: '400',
      marginBottom: '.5em',
    };
    const submenuLinkStyle = {
      marginTop: '.5em',
      fontWeight: '400',
    };

    const filteredUserStudies = (
      useEda && useUserDatasetsWorkspace ? diyDatasets : []
    )?.filter((study) =>
      stripHTML(study.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const filteredCommunityStudies = (
      useEda && useUserDatasetsWorkspace ? communityDatasets : []
    )?.filter((dataset) =>
      stripHTML(dataset.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const filteredCuratedStudies = studies.entities?.filter((study) =>
      stripHTML(study.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const isLoadingStudies =
      permissionsValue.loading ||
      filteredUserStudies == null ||
      filteredCommunityStudies == null ||
      filteredCuratedStudies == null;

    const hasUserDatasets =
      filteredUserStudies?.length > 0 || filteredCommunityStudies?.length > 0;

    return {
      mainMenu: [
        {
          id: 'studies',
          text: 'Studies',
          children: ({ isFocused }) =>
            [
              {
                text: (
                  <>
                    <DiyStudiesDaemon
                      isFocused={isFocused}
                      reloadDiyDatasets={reloadDiyDatasets}
                    />
                    <div style={{ padding: '0.5em 0' }}>
                      <i
                        className="ebrc-icon-table"
                        style={studyTableIconStyle}
                      ></i>{' '}
                      Study summaries table
                    </div>
                  </>
                ),
                route: '/search/dataset/Studies/result',
              },
              {
                text: (
                  <StudyMenuSearch
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                  />
                ),
              },
            ].concat(
              isLoadingStudies
                ? [
                    {
                      text: (
                        <i
                          style={{ fontSize: '13em' }}
                          className="fa fa-align-justify"
                        />
                      ),
                    },
                  ]
                : [].concat(
                    filteredUserStudies == null
                      ? []
                      : [
                          {
                            isVisible: filteredUserStudies.length > 0,
                            text: (
                              <CollapsibleDetailsSection
                                summary="My studies"
                                collapsibleDetails={filteredUserStudies.map(
                                  (study, idx) => (
                                    <DIYStudyMenuItem
                                      key={idx}
                                      name={study.name}
                                      link={`${study.baseEdaRoute}/new`}
                                      isChildOfCollapsibleSection={true}
                                    />
                                  )
                                )}
                                showDetails={expandUserStudies}
                                setShowDetails={setExpandUserStudies}
                              />
                            ),
                          },
                        ],
                    filteredCuratedStudies == null || permissionsValue.loading
                      ? []
                      : [
                          {
                            isVisible: filteredCuratedStudies.length > 0,
                            text: hasUserDatasets ? (
                              <CollapsibleDetailsSection
                                summary="Curated studies"
                                collapsibleDetails={filteredCuratedStudies.map(
                                  (study, idx) => (
                                    <StudyMenuItem
                                      key={idx}
                                      study={study}
                                      config={siteConfig}
                                      permissions={permissionsValue.permissions}
                                      isChildOfCollapsibleSection={true}
                                    />
                                  )
                                )}
                                showDetails={expandCuratedStudies}
                                setShowDetails={setExpandCuratedStudies}
                              />
                            ) : (
                              filteredCuratedStudies.map((study) => (
                                <StudyMenuItem
                                  study={study}
                                  config={siteConfig}
                                  permissions={permissionsValue.permissions}
                                />
                              ))
                            ),
                          },
                        ],
                    filteredCommunityStudies == null
                      ? []
                      : [
                          {
                            isVisible: filteredCommunityStudies.length > 0,
                            text: (
                              <CollapsibleDetailsSection
                                summary="Community studies"
                                collapsibleDetails={filteredCommunityStudies.map(
                                  (study, idx) => (
                                    <DIYStudyMenuItem
                                      key={idx}
                                      name={study.name}
                                      link={`${study.baseEdaRoute}/new`}
                                      isChildOfCollapsibleSection={true}
                                    />
                                  )
                                )}
                                showDetails={expandCommunityStudies}
                                setShowDetails={setExpandCommunityStudies}
                              />
                            ),
                          },
                        ]
                  )
            ),
        },
        {
          id: 'workspace',
          text: 'Workspace',
          children: [
            {
              text: 'My Analyses',
              route: makeEdaRoute(),
            },
            ...(useUserDatasetsWorkspace
              ? [
                  {
                    text: 'My Studies',
                    route: '/workspace/datasets',
                  },
                ]
              : []),
            {
              text: 'Public Analyses',
              route: `${makeEdaRoute()}/public`,
            },
            ...(requireLogin
              ? [
                  {
                    text: (
                      <div>
                        <div style={submenuStyle}>
                          Interactive Maps <img alt="BETA" src={betaImage} />
                        </div>
                        <ul>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_28cc5ab0d2/new"
                            >
                              Monkeypox - ECDC
                            </Link>
                          </li>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_e0765cae4d/new"
                            >
                              Monkeypox - World
                            </Link>
                          </li>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_d6a1141fbf/new"
                            >
                              SCORE <i>S. mansoni</i> Cluster Randomized Trial
                            </Link>
                          </li>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_cc143c9cef/new"
                            >
                              SCORE Mozambique <i>S. haematobium</i> Cluster
                              Randomized Trial
                            </Link>
                          </li>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_6bd7dbd802/new"
                            >
                              SCORE Seasonal Transmission <i>S. haematobium</i>{' '}
                              Cluster Randomized Trial
                            </Link>
                          </li>
                          <li style={submenuLinkStyle}>
                            <Link
                              className="SiteMenuItem-Link"
                              to="/workspace/maps/DS_24899fbd90/new"
                            >
                              WWARN Cross-sectional
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ),
                  },
                ]
              : []),
          ],
        },
        {
          id: 'help',
          text: 'Help',
          children: [
            {
              text: 'Tutorials',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/tutorials.html`,
            },
            {
              text: 'Webinars',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/webinars.html`,
            },
            {
              text: 'Workshops',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/workshops.html`,
            },
            {
              text: 'External Resources',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/resources.html`,
            },
          ],
        },
        {
          id: 'about',
          text: 'About',
          children: [
            {
              text: 'About ClinEpiDB',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/about.html`,
            },
            {
              text: 'News',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/news.html`,
            },
            {
              text: 'FAQ',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/faq.html`,
            },
            {
              text: 'Submit Data to ClinEpiDB',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/submit.html`,
            },
            {
              text: 'Data Access & Use Policy',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/access_and_use.html`,
            },
            {
              text: 'Publications about ClinEpiDB',
              url: 'https://gatesopenresearch.org/articles/3-1661',
              target: '_blank',
            },
            {
              text: 'Publications that use our resource',
              url: 'https://scholar.google.com/scholar?hl=en&q=ClinEpiDB',
              target: '_blank',
            },
            {
              text: 'Features coming soon',
              route: `${STATIC_ROUTE_PATH}/ClinEpiDB/newfeatures.html`,
            },
            ...socialLinks,
          ],
        },
        {
          target: '_blank',
          id: 'contactus',
          text: 'Contact Us',
          route: '/contact-us',
        },
      ],
      iconMenu: [...socialIcons],
    };
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
