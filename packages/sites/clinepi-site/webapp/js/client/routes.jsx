import React from 'react';

import AccessRequestController from './controllers/AccessRequestController';
import AboutController from './controllers/AboutController';

export const wrapRoutes = ebrcRoutes => { 
  return [

    {
      path: '/request-access/:datasetId',
      component: props => <AccessRequestController {...props.match.params}/>
    },

    {
      path: '/about',
      component: () => <AboutController/>
    },

    ...ebrcRoutes
  ];
};
