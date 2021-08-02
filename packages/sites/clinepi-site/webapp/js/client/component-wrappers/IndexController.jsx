import React, { useMemo } from 'react';
import CardBasedIndexController from '@veupathdb/web-common/lib/controllers/CardBasedIndexController';
import { usePermissions } from '@veupathdb/web-common/lib/hooks/permissions';

import { getStaticSiteData } from '../selectors/siteData';
import makeGetHomeContent from '../data/homeContent';

const searchesUserEmails = [ 'eupathdb@gmail.com' ];

export default function IndexControllerWrapper() {
  return function IndexController() {
    const permissionsValue = usePermissions();

    const getHomeContent = useMemo(
      () => makeGetHomeContent(permissionsValue),
      [permissionsValue]
    );

    return (
      <CardBasedIndexController
        searchesUserEmails={searchesUserEmails}
        getSiteData={getStaticSiteData}
        getHomeContent={getHomeContent}
      />
    )
  }
}
