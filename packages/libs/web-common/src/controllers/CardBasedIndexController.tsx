import { connect } from 'react-redux';
import React from 'react';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import { attemptAction } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionActionCreators';
import { requestNews } from '../App/NewsSidebar/NewsModule';
import { loadSearches } from '../App/Searches/SearchCardActionCreators';
import { requestStudies } from '../App/Studies/StudyActionCreators';
import CardBasedIndex from '../components/CardBasedIndex';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

interface OwnProps {
  getSiteData: (state: RootState) => unknown;
  getHomeContent: (siteData: unknown) => unknown;
  searchesUserEmails?: string[];
}

interface ConnectedProps {
  displayName?: string;
  siteData: unknown;
  newsSidebar: unknown;
  homeContent: unknown;
  attemptAction: typeof attemptAction;
  loadSearches: typeof loadSearches;
  requestNews: typeof requestNews;
  requestStudies: typeof requestStudies;
  searchesUserEmails?: string[];
}

type CardBasedIndexControllerProps = ConnectedProps & OwnProps;

const enhance = connect(
  (state: RootState, props: OwnProps) => {
    const { getSiteData, getHomeContent } = props;
    const { globalData, newsSidebar } = state;
    const { siteConfig, config } = globalData;
    const siteData = getSiteData(state);
    const homeContent = getHomeContent(siteData);

    return { ...siteConfig, ...config, siteData, newsSidebar, homeContent };
  },
  { attemptAction, loadSearches, requestNews, requestStudies }
);

class CardBasedIndexController extends PageController<CardBasedIndexControllerProps> {
  getTitle() {
    return this.props.displayName || '';
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.loadSearches(this.props.searchesUserEmails);
    this.props.requestNews();
    this.props.requestStudies();
  }

  renderView() {
    return <CardBasedIndex {...this.props} />;
  }
}

export default enhance(CardBasedIndexController);
