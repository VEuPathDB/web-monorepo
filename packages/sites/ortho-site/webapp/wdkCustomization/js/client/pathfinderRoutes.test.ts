import { PathfinderController } from '@veupathdb/web-common/lib/controllers/PathfinderController';

import { pathfinderRoutes, pathfinderToolItems } from './pathfinderRoutes';

describe('PathFinder on OrthoMCL', () => {
  it('routes /pathfinder to the PathFinder page behind sign-in when it is configured', () => {
    expect(pathfinderRoutes('/pathfinder')).toEqual([
      {
        path: '/pathfinder',
        exact: false,
        requiresLogin: true,
        component: PathfinderController,
        rootClassNameModifier: 'pathfinder',
      },
    ]);
  });

  it('offers PathFinder under Tools when it is configured', () => {
    expect(pathfinderToolItems('/pathfinder')).toEqual([
      {
        key: 'pathfinder',
        display: 'PathFinder',
        tooltip: 'Build and refine search strategies with an AI assistant',
        type: 'reactRoute',
        url: '/pathfinder',
      },
    ]);
  });

  it('adds neither the route nor the menu entry when PathFinder is not configured', () => {
    expect([pathfinderRoutes(''), pathfinderToolItems('')]).toEqual([[], []]);
  });
});
