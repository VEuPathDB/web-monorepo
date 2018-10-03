import AccessRequestController from './controllers/AccessRequestController';

export const wrapRoutes = ebrcRoutes => { 
  return [
    { path: '/request-access/:datasetId', component: AccessRequestController },
    ...ebrcRoutes
  ];
};
