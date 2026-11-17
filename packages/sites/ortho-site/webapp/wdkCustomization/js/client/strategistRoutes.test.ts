import {
  StrategistController,
  StrategistRedirect,
} from '@veupathdb/web-common/lib/controllers/StrategistController';

import { strategistRoutes, strategistToolItems } from './strategistRoutes';

describe('Strategist on OrthoMCL', () => {
  it('routes /strategist to the Strategist page behind sign-in, and /pathfinder to it, when it is configured', () => {
    expect(strategistRoutes('/pathfinder')).toEqual([
      {
        path: '/strategist',
        exact: false,
        requiresLogin: true,
        component: StrategistController,
        rootClassNameModifier: 'strategist',
      },
      {
        path: '/pathfinder',
        exact: false,
        component: StrategistRedirect,
      },
    ]);
  });

  it('offers Strategist under Tools when it is configured', () => {
    expect(strategistToolItems('/pathfinder')).toEqual([
      {
        key: 'strategist',
        display: 'VEuPathDB Strategist',
        tooltip: 'Build and refine search strategies with an AI assistant',
        type: 'reactRoute',
        url: '/strategist',
      },
    ]);
  });

  it('adds neither the route nor the menu entry when Strategist is not configured', () => {
    expect([strategistRoutes(''), strategistToolItems('')]).toEqual([[], []]);
  });
});
