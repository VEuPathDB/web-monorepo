import React from 'react';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import AboutController from './controllers/AboutController';
import { userDatasetRoutes } from './routes/userDatasetRoutes';

export function wrapRoutes(ebrcRoutes) {
  return [
    {
      path: '/about',
      component: () => <AboutController/>
    },
    
    ...(
      useUserDatasetsWorkspace
        ? userDatasetRoutes
        : []
    ),

    ...ebrcRoutes
  ];
}
