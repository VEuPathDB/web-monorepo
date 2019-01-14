import AccessRequestController from './controllers/AccessRequestController';
import AboutController from './controllers/AboutController';

export const wrapRoutes = ebrcRoutes => { 
  return [
    { path: '/request-access/:datasetId', component: AccessRequestController },
    { path: '/about', component: AboutController },
    ...ebrcRoutes
  ];
};
