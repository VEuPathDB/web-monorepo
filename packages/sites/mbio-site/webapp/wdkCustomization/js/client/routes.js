import AboutController from './controllers/AboutController';

export function wrapRoutes(routes) {
  return [
    { path: '/about', component: AboutController },
    ...routes
  ];
}
