import React from 'react';
import Header from '@veupathdb/web-common/lib/App/Header';
import Footer from '@veupathdb/web-common/lib/components/Footer';
import CardBasedIndexController from '@veupathdb/web-common/lib/controllers/CardBasedIndexController';
import StudyAnswerController from '@veupathdb/web-common/lib/component-wrappers/StudyAnswerController';
import StudyRecordHeading from '@veupathdb/web-common/lib/component-wrappers/StudyRecordHeading';
import { menuItemsFromSocials, iconMenuItemsFromSocials } from '@veupathdb/web-common/lib/App/Utils/Utils';
import { StudyMenuItem } from '@veupathdb/web-common/lib/App/Studies';
import logoUrl from 'site/images/18170.png';
import heroImageUrl from 'site/images/mbio_hero.png';
import vizData from './visualizations.json';
import { STATIC_ROUTE_PATH } from '@veupathdb/web-common/lib/routes';

import { StudyCard } from '@veupathdb/web-common/lib/App/Studies';
import { SearchCard } from '@veupathdb/web-common/lib/App/Searches';
import { ImageCard } from '@veupathdb/web-common/lib/App/ImageCard';

import { studyMatchPredicate, studyFilters } from '@veupathdb/web-common/lib/util/homeContent';

export default {
  SiteHeader: () => SiteHeader,
  IndexController: () => IndexController,
  Footer: () => SiteFooter,
  RecordHeading: DefaultComponent => props => props.recordClass.urlSegment === 'dataset'
    ? <StudyRecordHeading {...props} DefaultComponent={DefaultComponent} showSearches />
    : <DefaultComponent {...props }/>,
  AnswerController: DefaultComponent => props => props.ownProps.recordClass === 'dataset'
    ? <StudyAnswerController {...props} DefaultComponent={DefaultComponent} />
    : <DefaultComponent {...props }/>
}

function SiteFooter() {
  return (
    <Footer
      siteAck={ {linkTo:"http://www.vet.upenn.edu/", imageLocation:"/a/images/PrivateLogo.png"} }
    />
  );
}

function SiteHeader() {
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
    />
  );
}

const searchesUserEmails = [ 'eupathdb@gmail.com' ];

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
    visualizations: { isLoading: false, entities: vizData }
  };
}

function getHomeContent({ studies, searches, visualizations }) {
  return [
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
      getSearchStringForItem: item => 
        item.searchString,
      matchPredicate: studyMatchPredicate
    },
    {
      title: 'Explore Example Searches',
      description: 'MicrobiomeDB can be used to employ a sophisticated search strategy system to explore study data. Use the example searches below to jump to saved strategies, view their results and get acquainted with MicrobiomeDB capabilities.',
      viewAllAppUrl: '/app/workspace/strategies/public',
      contentType: 'SearchCardList',
      contentNamePlural: 'searches',
      items: searches.entities,
      isLoading: searches.loading,
      cardComponent: SearchCard,
      getSearchStringForItem: item =>
        item.name + ' ' + item.description
    },
    {
      title: 'Explore Visualization Tools',
      description: 'Gain clear insights into your data and illustrate powerful connections using our visualization and analysis tools. Use the brief tutorials below to get learn how to get started exploring data with these resources.',
      contentType: 'ImageCardList',
      contentNamePlural: 'visualizations',
      items: visualizations.entities,
      isLoading: visualizations.loading,
      cardComponent: ImageCard,
      getSearchStringForItem: item =>
        item.title + ' ' + item.description
    }
  ];
}

function makeHeaderMenuItems(state) {
  const { siteConfig } = state.globalData;
  const siteData = getSiteData(state);
  const { studies } = siteData;
  const socialIcons = iconMenuItemsFromSocials(siteConfig);
  const socialLinks = menuItemsFromSocials(siteConfig);
  const {vimeoUrl} = siteConfig;

  return {
    mainMenu: [
      {
        id: 'search',
        text: 'Search a Study',
        children: [
          {
            text: <div style={{ padding: '0.5em 0' }}>View All Studies</div>,
            route: '/search/dataset/Studies/result'
          }
        ].concat(studies.entities == null ? [] : studies.entities
          .map(study => ({ text: <StudyMenuItem study={study} config={siteConfig} /> })))
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
            text: 'My Favorites',
            route: '/workspace/favorites',
            loginRequired: true
          },
          {
            text: 'Public Search Strategies',
            route: '/workspace/strategies/public'
          },
          {
            text: 'My Data Sets',
            route: '/workspace/datasets'
          }
        ]
      },
      {
        id: 'about',
        text: 'About',
        children: [
          {
            text: 'FAQs',
            route: `${STATIC_ROUTE_PATH}/MicrobiomeDB/faq.html`
          },
          {
            text: 'News',
            route: `${STATIC_ROUTE_PATH}/MicrobiomeDB/news.html`
          },
          {
            text: 'Tutorials and Resources',
            url: vimeoUrl,
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
}

