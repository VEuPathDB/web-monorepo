import { RouteEntry } from 'wdk-client/Core/RouteEntry';

import { OrthoMCLHomePageController } from './controllers/OrthoMCLHomePageController';

export function wrapRoutes(ebrcRoutes: RouteEntry[]): RouteEntry[] {
  return [
    {
      path: '/',
      component: OrthoMCLHomePageController,
      rootClassNameModifier: 'home-page'
    },
    ...ebrcRoutes
  ];
}
