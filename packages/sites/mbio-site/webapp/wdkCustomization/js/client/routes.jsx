import React from 'react';

import AboutController from './controllers/AboutController';
import { userDatasetRoutes } from './routes/userDatasetRoutes';

export function wrapRoutes(ebrcRoutes) {
  return [
    {
      path: '/about',
      component: () => <AboutController/>
    },
    
    ...userDatasetRoutes,

    ...ebrcRoutes
  ];
}
