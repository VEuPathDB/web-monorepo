import React from 'react';
import { Redirect } from 'react-router-dom';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import AccessRequestController from './controllers/AccessRequestController';

export const wrapRoutes = ebrcRoutes => { 
  return [

    {
      path: '/request-access/:datasetId',
      component: props => <AccessRequestController {...props.match.params}/>
    },

    // Redirect dataset record page to eda analysis page
    {
      path: '/record/dataset/:datasetId',
      component: props => <Redirect to={makeEdaRoute(props.match.params.datasetId) + '/new'}/>
    },

    ...ebrcRoutes
  ];
};
