import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { HeaderMenuItem } from '@veupathdb/web-common/lib/components/homepage/Header';
import { StrategistController } from '@veupathdb/web-common/lib/controllers/StrategistController';

export function strategistRoutes(strategistUrl: string): RouteEntry[] {
  return strategistUrl
    ? [
        {
          path: '/strategist',
          exact: false,
          requiresLogin: true,
          component: StrategistController,
          rootClassNameModifier: 'strategist',
        },
      ]
    : [];
}

export function strategistToolItems(strategistUrl: string): HeaderMenuItem[] {
  return strategistUrl
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
