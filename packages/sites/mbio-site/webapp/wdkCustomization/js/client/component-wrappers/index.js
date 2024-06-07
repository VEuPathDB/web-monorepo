import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import Header from '@veupathdb/web-common/lib/App/Header';
import Footer from '@veupathdb/web-common/lib/components/Footer';
import { DIYStudyMenuItem } from '@veupathdb/web-common/lib/App/Studies/DIYStudyMenuItem';
import CardBasedIndexController from '@veupathdb/web-common/lib/controllers/CardBasedIndexController';
import StudyAnswerController from '@veupathdb/web-common/lib/component-wrappers/StudyAnswerController';
import StudyRecordHeading from '@veupathdb/web-common/lib/component-wrappers/StudyRecordHeading';
import {
  menuItemsFromSocials,
  iconMenuItemsFromSocials,
} from '@veupathdb/web-common/lib/App/Utils/Utils';
import {
  StudyMenuItem,
  StudyMenuSearch,
} from '@veupathdb/web-common/lib/App/Studies';
import logoUrl from 'site/images/18170.png';
import heroImageUrl from 'site/images/mbio_hero.png';
import vizData from '../visualizations.json';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';
import { AnalysisCard } from '@veupathdb/web-common/lib/App/Analyses';
import { StudyCard } from '@veupathdb/web-common/lib/App/Studies';
import { SearchCard } from '@veupathdb/web-common/lib/App/Searches';
import { ImageCard } from '@veupathdb/web-common/lib/App/ImageCard';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useDiyDatasets } from '@veupathdb/web-common/lib/hooks/diyDatasets';

import {
  studyMatchPredicate,
  studyFilters,
} from '@veupathdb/web-common/lib/util/homeContent';
import {
  useUserDatasetsWorkspace,
  edaExampleAnalysesAuthors,
} from '@veupathdb/web-common/lib/config';
import { useEda } from '@veupathdb/web-common/lib/config';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { CollapsibleDetailsSection } from '@veupathdb/wdk-client/lib/Components';

import { Page } from './Page';

export default {
  SiteHeader: () => SiteHeader,
  IndexController: () => IndexController,
  Footer: () => SiteFooter,
  RecordHeading: (DefaultComponent) => (props) =>
    props.recordClass.urlSegment === 'dataset' ? (
      <StudyRecordHeading
        {...props}
        DefaultComponent={DefaultComponent}
        showSearches
      />
    ) : (
      <DefaultComponent {...props} />
    ),
  AnswerController: (DefaultComponent) => (props) =>
    props.ownProps.recordClass === 'dataset' ? (
      <StudyAnswerController {...props} DefaultComponent={DefaultComponent} />
    ) : (
      <DefaultComponent {...props} />
    ),
  Page,
};

function SiteFooter() {
  return (
    <Footer
      siteAck={{
        linkTo: 'http://www.vet.upenn.edu/',
        imageLocation: '/a/images/PrivateLogo.png',
      }}
    />
  );
}

function SiteHeader() {
  const permissions = usePermissions();
  const { diyDatasets, communityDatasets, reloadDiyDatasets } =
    useDiyDatasets();
  const [searchTerm, setSearchTerm] = useSessionBackedState(
    '',
    'SiteHeader__filterString',
    (s) => s,
    (s) => s
  );

  // for now, we default to each studies section being open
  const [expandUserStudies, setExpandUserStudies] = useState(true);
  const [expandCommunityStudies, setExpandCommunityStudies] = useState(true);
  const [expandCuratedStudies, setExpandCuratedStudies] = useState(true);

  const handleStudiesMenuSearch = useCallback(
    (newValue) => {
      setSearchTerm(newValue);
      // open both studies sections onSearch only if diyDatasets exist
      if (newValue.length > 0 && diyDatasets && diyDatasets.length > 0) {
        setExpandUserStudies(true);
        setExpandCuratedStudies(true);
      }
    },
    [diyDatasets, setSearchTerm, setExpandUserStudies, setExpandCuratedStudies]
  );

  const makeHeaderMenuItems = useMemo(
    () =>
      makeHeaderMenuItemsFactory(
        permissions,
        diyDatasets,
        communityDatasets,
        reloadDiyDatasets,
        expandUserStudies,
        setExpandUserStudies,
        expandCommunityStudies,
        setExpandCommunityStudies,
        expandCuratedStudies,
        setExpandCuratedStudies
      ),
    [
      permissions,
      diyDatasets,
      reloadDiyDatasets,
      expandUserStudies,
      setExpandUserStudies,
      expandCuratedStudies,
      setExpandCuratedStudies,
    ]
  );
  return (
    <Header
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      heroImagePosition="left top"
      titleWithoutDB="Microbiome"
      subTitle="A Microbiome Resource"
      tagline="A data-mining platform for interrogating microbiome experiments"
      getSiteData={getSiteData}
      makeHeaderMenuItems={makeHeaderMenuItems}
      searchTerm={searchTerm}
      setSearchTerm={handleStudiesMenuSearch}
    />
  );
}

const searchesUserEmails = ['eupathdb@gmail.com'];

function IndexController() {
  return (
    <CardBasedIndexController
      searchesUserEmails={searchesUserEmails}
      getSiteData={getSiteData}
      getHomeContent={getHomeContent}
    />
  );
}

function getSiteData(state) {
  return {
    studies: state.studies,
    searches: state.searchCards,
    visualizations: { isLoading: false, entities: vizData },
  };
}

function getHomeContent({ studies, searches, visualizations }) {
  return useEda
    ? [
        {
          title: 'Explore the Studies',
          description:
            'Analyze data from the publicly available studies below.',
          contentType: 'StudyCardList',
          contentNamePlural: 'studies',
          // filters: studyFilters(studies),
          // filtersLabel: 'disease',
          items: studies.entities,
          isLoading: studies.loading,
          isExpandable: true,
          // uncomment the next line to disable the cards search
          // isSearchable: !siteSearchServiceUrl,
          tableViewLink: '/search/dataset/Studies/result',
          tableViewLinkText: 'Study summaries table',
          cardComponent: StudyCard,
          getSearchStringForItem: (item) => item.searchString,
          matchPredicate: studyMatchPredicate,
        },
        {
          title: 'Explore Example Analyses',
          description:
            'Learn how to use MicrobiomeDB analyses to investigate and visualize data.',
          viewAllAppUrl: '/app/workspace/analyses/public',
          contentType: 'AnalysisCardList',
          contentNamePlural: 'analyses',
          items: searches.entities,
          isLoading: searches.loading,
          cardComponent: AnalysisCard,
          getSearchStringForItem: (item) => item.name + ' ' + item.description,
          loadItems,
        },
      ]
    : [
        {
          title: 'Explore the Studies',
          contentType: 'StudyCardList',
          contentNamePlural: 'studies',
          filters: studyFilters(studies),
          items: studies.entities,
          isLoading: studies.loading,
          isExpandable: true,
          tableViewLink: '/search/dataset/Studies/result',
          tableViewLinkText: 'Study summaries table',
          cardComponent: StudyCard,
          getSearchStringForItem: (item) => item.searchString,
          matchPredicate: studyMatchPredicate,
        },
        {
          title: 'Explore Example Searches',
          description:
            'MicrobiomeDB can be used to employ a sophisticated search strategy system to explore study data. Use the example searches below to jump to saved strategies, view their results and get acquainted with MicrobiomeDB capabilities.',
          viewAllAppUrl: '/app/workspace/strategies/public',
          contentType: 'SearchCardList',
          contentNamePlural: 'searches',
          items: searches.entities,
          isLoading: searches.loading,
          cardComponent: SearchCard,
          getSearchStringForItem: (item) => item.name + ' ' + item.description,
        },
        {
          title: 'Explore Visualization Tools',
          description:
            'Gain clear insights into your data and illustrate powerful connections using our visualization and analysis tools. Use the brief tutorials below to get learn how to get started exploring data with these resources.',
          contentType: 'ImageCardList',
          contentNamePlural: 'visualizations',
          items: visualizations.entities,
          isLoading: visualizations.loading,
          cardComponent: ImageCard,
          getSearchStringForItem: (item) => item.title + ' ' + item.description,
        },
      ];
}

function makeHeaderMenuItemsFactory(
  permissionsValue,
  diyDatasets,
  communityStudies,
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
    const siteData = getSiteData(state);
    const { studies } = siteData;
    const socialIcons = iconMenuItemsFromSocials(siteConfig);
    const socialLinks = menuItemsFromSocials(siteConfig);
    const { vimeoUrl } = siteConfig;
    const searchTerm = props.searchTerm;
    const setSearchTerm = props.setSearchTerm;

    const filteredUserStudies = (
      useEda && useUserDatasetsWorkspace ? diyDatasets : []
    )?.filter((study) =>
      stripHTML(study.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );
    const filteredCommunityStudies = (
      useEda && useUserDatasetsWorkspace ? communityStudies : []
    )?.filter((study) =>
      stripHTML(study.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const filteredCuratedStudies = studies.entities?.filter((study) =>
      stripHTML(study.name.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const studyTableIconStyle = {
      fontSize: '1.4em',
      marginRight: '.25em',
      position: 'relative',
      bottom: '-.25em',
    };

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
              filteredCuratedStudies != null &&
                filteredCommunityStudies != null &&
                filteredUserStudies != null &&
                !permissionsValue.loading
                ? diyDatasets?.length > 0 && studies.entities?.length > 0
                  ? // here we have user studies and curated studies, so render "My studies" and "Curated studies" sections
                    [
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
                    ].concat([
                      {
                        isVisible: filteredCuratedStudies.length > 0,
                        text: (
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
                        ),
                      },
                    ])
                  : // here we do not have user studies so need for sections; just list the studies
                    filteredCuratedStudies.map((study) => ({
                      text: (
                        <StudyMenuItem
                          study={study}
                          config={siteConfig}
                          permissions={permissionsValue.permissions}
                        />
                      ),
                    }))
                : [
                    {
                      text: (
                        <i
                          style={{ fontSize: '13em' }}
                          className="fa fa-align-justify"
                        />
                      ),
                    },
                  ]
            ),
        },
        {
          id: 'workspace',
          text: 'Workspace',
          children: useEda
            ? [
                {
                  text: 'My analyses',
                  route: '/workspace/analyses',
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
                  text: 'Public analyses',
                  route: '/workspace/analyses/public',
                },
              ]
            : [
                {
                  text: 'My Search Strategies',
                  route: '/workspace/strategies',
                },
                {
                  text: 'My Basket',
                  route: '/workspace/basket',
                  loginRequired: true,
                },
                {
                  text: 'My Favorites',
                  route: '/workspace/favorites',
                  loginRequired: true,
                },
                {
                  text: 'Public Search Strategies',
                  route: '/workspace/strategies/public',
                },
                ...(useUserDatasetsWorkspace
                  ? [
                      {
                        text: 'My Data Sets',
                        route: '/workspace/datasets',
                      },
                    ]
                  : []),
              ],
        },
        {
          id: 'about',
          text: 'About',
          children: [
            {
              text: 'FAQs',
              route: useEda
                ? `${STATIC_ROUTE_PATH}/MicrobiomeDB/faq_beta.html`
                : `${STATIC_ROUTE_PATH}/MicrobiomeDB/faq.html`,
            },
            {
              text: 'News',
              route: `${STATIC_ROUTE_PATH}/MicrobiomeDB/news.html`,
            },
            {
              text: 'Tutorials and Resources',
              url: vimeoUrl,
              target: '_blank',
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

async function loadItems({ analysisClient, wdkService }) {
  const overviews = await analysisClient.getPublicAnalyses();
  const studies = await wdkService.getStudies();
  const userIds = edaExampleAnalysesAuthors;
  return overviews
    .filter((analysis) => userIds?.includes(analysis.userId) ?? true)
    .flatMap((overview) => {
      const study = studies.records.find(
        (study) => study.attributes.dataset_id === overview.studyId
      );
      if (study == null) return [];
      return [
        {
          displayName: overview.displayName,
          studyDisplayName: study.displayName,
          description: overview.description,
          studyId: overview.studyId,
          analysisId: overview.analysisId,
        },
      ];
    });
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
