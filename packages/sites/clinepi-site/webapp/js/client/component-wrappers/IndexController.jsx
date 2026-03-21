import { connect } from 'react-redux';
import React, { useMemo } from 'react';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import { attemptAction } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionActionCreators';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { requestNews } from '@veupathdb/web-common/lib/App/NewsSidebar/NewsModule';
import { loadSearches } from '@veupathdb/web-common/lib/App/Searches/SearchCardActionCreators';
import { requestStudies } from '@veupathdb/web-common/lib/App/Studies/StudyActionCreators';
import HomePage from './Home';

import { getStaticSiteData } from '../selectors/siteData';
import makeGetHomeContent from '../data/homeContent';

const searchesUserEmails = ['eupathdb@gmail.com'];

const enhance = connect(
  (state, props) => {
    const { getSiteData, getHomeContent } = props;
    const { globalData, newsSidebar } = state;
    const { siteConfig, config } = globalData;
    const siteData = getSiteData(state);
    const homeContent = getHomeContent(siteData);

    return {
      ...siteConfig,
      ...config,
      siteData,
      newsSidebar,
      homeContent,
    };
  },
  { attemptAction, loadSearches, requestNews, requestStudies }
);

class ClinEpiIndexController extends PageController {
  getTitle() {
    return this.props.displayName || '';
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.loadSearches(searchesUserEmails);
    this.props.requestNews();
    this.props.requestStudies();
  }

  renderView() {
    return <HomePage {...this.props} />;
  }
}

export default function IndexControllerWrapper() {
  return function IndexController() {
    const permissionsValue = usePermissions();

    const getHomeContent = useMemo(
      () => makeGetHomeContent(permissionsValue),
      [permissionsValue]
    );

    const EnhancedController = enhance(ClinEpiIndexController);

    return (
      <EnhancedController
        getSiteData={getStaticSiteData}
        getHomeContent={getHomeContent}
      />
    );
  };
}
