import React from 'react';
import AccessRequestController from './controllers/AccessRequestController';

export const wrapRoutes = ebrcRoutes => { 
  return [

    {
      path: '/request-access/:datasetId',
      component: props => <AccessRequestController {...props.match.params}/>
    },

    ...ebrcRoutes
  ];
};
