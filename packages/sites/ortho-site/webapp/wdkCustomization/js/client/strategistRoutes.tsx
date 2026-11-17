import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { HeaderMenuItem } from '@veupathdb/web-common/lib/components/homepage/Header';
import {
  StrategistController,
  StrategistRedirect,
} from '@veupathdb/web-common/lib/controllers/StrategistController';

export function strategistRoutes(pathfinderUrl: string): RouteEntry[] {
  return pathfinderUrl
    ? [
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
      ]
    : [];
}

export function strategistToolItems(pathfinderUrl: string): HeaderMenuItem[] {
  return pathfinderUrl
    ? [
        {
          key: 'strategist',
          display: 'VEuPathDB Strategist',
          tooltip: 'Build and refine search strategies with an AI assistant',
          type: 'reactRoute',
          url: '/strategist',
        },
      ]
    : [];
}
