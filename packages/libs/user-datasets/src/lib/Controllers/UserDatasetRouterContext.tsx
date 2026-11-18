import React, { ReactNode, useContext } from 'react';

import { DatasetWorkspaceConfig } from '../Common/Configuration';
import { DataNoun } from '../Utils';
import { VdiMetadata } from '../Service/utils/use-vdi';

/**
 * Values supplied by `UserDatasetRouter` to its route components.
 *
 * Route components passed to `WdkRoute` must have a stable identity, or React
 * treats each render as a new component type and remounts the whole subtree.
 * They therefore cannot be defined inline inside `UserDatasetRouter` (where
 * they would close over these values), so they live at module scope and read
 * what they need from this context instead.
 */
export interface UserDatasetRouterContextValue {
  /** URL at which the router is mounted (`url` from `useRouteMatch`) */
  readonly baseUrl: string;
  readonly detailsPageTitle: string;
  readonly helpRoute: string;
  readonly workspaceTitle: string;
  readonly helpTabContents?: ReactNode;
  readonly dataNoun: DataNoun;
  readonly enablePublicUserDatasets: boolean;
  readonly workspaceConfig: DatasetWorkspaceConfig;
  readonly vdiMetadata: VdiMetadata;
}

const UserDatasetRouterContext = React.createContext<
  UserDatasetRouterContextValue | undefined
>(undefined);

export const UserDatasetRouterProvider = UserDatasetRouterContext.Provider;

export function useUserDatasetRouterContext(): UserDatasetRouterContextValue {
  const value = useContext(UserDatasetRouterContext);

  if (value == null) {
    throw new Error(
      'useUserDatasetRouterContext must be used within a UserDatasetRouterProvider'
    );
  }

  return value;
}
