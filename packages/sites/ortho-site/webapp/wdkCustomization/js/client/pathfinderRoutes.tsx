import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { HeaderMenuItem } from '@veupathdb/web-common/lib/components/homepage/Header';
import { PathfinderController } from '@veupathdb/web-common/lib/controllers/PathfinderController';

export function pathfinderRoutes(pathfinderUrl: string): RouteEntry[] {
  return pathfinderUrl
    ? [
        {
          path: '/pathfinder',
          exact: false,
          requiresLogin: true,
          component: PathfinderController,
          rootClassNameModifier: 'pathfinder',
        },
      ]
    : [];
}

export function pathfinderToolItems(pathfinderUrl: string): HeaderMenuItem[] {
  return pathfinderUrl
    ? [
        {
          key: 'pathfinder',
          display: 'PathFinder',
          tooltip: 'Build and refine search strategies with an AI assistant',
          type: 'reactRoute',
          url: '/pathfinder',
        },
      ]
    : [];
}
