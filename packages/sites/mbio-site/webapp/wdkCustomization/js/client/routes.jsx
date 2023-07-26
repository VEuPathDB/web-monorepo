import React from 'react';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';
import SiteSearchController from '@veupathdb/web-common/lib/controllers/SiteSearchController';

import AboutController from './controllers/AboutController';
import { userDatasetRoutes } from './routes/userDatasetRoutes';

export function wrapRoutes(ebrcRoutes) {
  return [
    {
      path: '/about',
      component: () => <AboutController />,
    },
    {
      path: '/search',
      component: () => (
        <SiteSearchController
          offerOrganismFilter={false}
          preferredOrganisms={false}
        />
      ),
    },
    ...(useUserDatasetsWorkspace ? userDatasetRoutes : []),

    ...ebrcRoutes,
  ];
}
