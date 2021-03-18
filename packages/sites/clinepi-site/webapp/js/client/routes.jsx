import React from 'react';
import AccessRequestController from './controllers/AccessRequestController';
import { WorkspaceRouter } from '@veupathdb/eda/lib/workspace/WorkspaceRouter';

const edaServiceUrl = '/eda-data';

export const wrapRoutes = ebrcRoutes => { 
  return [

    {
      path: '/request-access/:datasetId',
      component: props => <AccessRequestController {...props.match.params}/>
    },

    {
      path: '/eda',
      exact: false,
      component: () => <WorkspaceRouter
        dataServiceUrl={edaServiceUrl}
        subsettingServiceUrl={edaServiceUrl}
      />
    },

    ...ebrcRoutes
  ];
};
