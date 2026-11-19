import { ReactNode, useMemo } from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import { DataNoun } from '../Utils';

import { DatasetWorkspaceConfig } from '../Common/Configuration';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useVdiMetadata } from '../Service/utils/use-vdi';
import {
  ManageOrEditDatasetRoute,
  UserDatasetsWorkspaceRoute,
} from './UserDatasetRouteComponents';
import {
  UserDatasetRouterContextValue,
  UserDatasetRouterProvider,
} from './UserDatasetRouterContext';

interface Props {
  detailsPageTitle: string;
  helpRoute: string;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  dataNoun: DataNoun;
  enablePublicUserDatasets?: boolean;

  readonly workspaceConfig: DatasetWorkspaceConfig;
}

export const UserDatasetRoutes = {
  NewDataset: '/new/:type?',
  ManageDataset: '/:id',
  EditDataset: '/:id/edit',
} as const;

export function UserDatasetRouter({
  workspaceConfig,
  detailsPageTitle,
  helpRoute,
  workspaceTitle,
  helpTabContents,
  dataNoun,
  enablePublicUserDatasets = false,
}: Props) {
  const { path, url } = useRouteMatch();

  const vdiMetadata = useVdiMetadata();

  const contextValue = useMemo(
    (): UserDatasetRouterContextValue | undefined =>
      vdiMetadata
        ? {
            baseUrl: url,
            detailsPageTitle,
            helpRoute,
            workspaceTitle,
            helpTabContents,
            dataNoun,
            enablePublicUserDatasets,
            workspaceConfig,
            vdiMetadata,
          }
        : undefined,
    [
      url,
      detailsPageTitle,
      helpRoute,
      workspaceTitle,
      helpTabContents,
      dataNoun,
      enablePublicUserDatasets,
      workspaceConfig,
      vdiMetadata,
    ]
  );

  if (!contextValue) return <Loading />;

  // The route components are defined at module scope and read what they need
  // from context. They must NOT be defined inline here: `WdkRoute` renders
  // `component` as an element type, and this router re-renders on every
  // navigation (via `useRouteMatch`), so an inline function would be a new type
  // each time and remount the page (e.g. when opening the edit modal).
  return (
    <UserDatasetRouterProvider value={contextValue}>
      <Switch>
        <WdkRoute
          path={path}
          exact={true}
          requiresLogin={false} // uses custom guest views
          component={UserDatasetsWorkspaceRoute}
        />
        <WdkRoute
          path={path + UserDatasetRoutes.NewDataset}
          exact={true}
          requiresLogin={false} // uses custom guest views
          component={UserDatasetsWorkspaceRoute}
        />
        <WdkRoute
          path={path + '/help'}
          exact={true}
          requiresLogin={false} // uses custom guest views
          component={UserDatasetsWorkspaceRoute}
        />
        <WdkRoute
          path={[
            path + UserDatasetRoutes.ManageDataset,
            path + UserDatasetRoutes.EditDataset,
          ]}
          exact={true}
          requiresLogin={true}
          component={ManageOrEditDatasetRoute}
        />
      </Switch>
    </UserDatasetRouterProvider>
  );
}
