import React from 'react';
import { Redirect } from 'react-router-dom';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import SiteSearchController from '@veupathdb/web-common/lib/controllers/SiteSearchController';
import AccessRequestController from './controllers/AccessRequestController';
import { userDatasetRoutes } from './routes/userDatasetRoutes';

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
    {
      path: '/search',
      component: () => <SiteSearchController offerOrganismFilter={false} preferredOrganisms={false} />
    },
    ...(
      useUserDatasetsWorkspace
        ? userDatasetRoutes
        : []
    ),

    ...ebrcRoutes
  ];
};
