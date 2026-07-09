import React, { ReactElement, ReactNode } from 'react';
import { isEmpty } from 'lodash';
import { Switch, Redirect } from 'react-router-dom';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { WorkspaceNavigationItem } from '@veupathdb/wdk-client/src/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import { DatasetUploadRoute } from './Upload';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import { DataNoun } from '../Utils/types';
import {
  DatasetTypeConfig,
  filterAvailableDataTypes,
  promoteTypeConfig,
} from '../Common/Configuration';
import { VdiMetadata } from '../Service/utils/use-vdi';
import { DatasetWorkspaceConfig } from '../Common/Configuration/DatasetWorkspaceConfig';

export interface UserDatasetWorkspaceProps {
  baseUrl: string;
  helpRoute: string;
  urlParams: Record<string, string>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;

  readonly vdiMetadata: VdiMetadata;
  readonly workspaceConfig: DatasetWorkspaceConfig;
  readonly datasetId?: string;
}

export function UserDatasetsWorkspace(
  props: UserDatasetWorkspaceProps
): ReactElement {
  const {
    baseUrl,
    helpRoute,
    workspaceTitle,
    helpTabContents,
    dataNoun,
    enablePublicUserDatasets,
    vdiMetadata,
    workspaceConfig: config,
  } = props;

  const datasetTypes = config.baseDatasetTypeConfigs
    .map((cdt) => promoteTypeConfig(cdt, vdiMetadata.plugins))
    .filter((v) => v !== undefined) as readonly DatasetTypeConfig[];

  const availableDataTypes = filterAvailableDataTypes(
    datasetTypes,
    vdiMetadata.plugins
  );
  const allowsUploads = !isEmpty(availableDataTypes);

  const routes: WorkspaceNavigationItem[] = [
    {
      display: 'Manage my datasets',
      route: '',
    },
  ];

  if (allowsUploads) {
    routes.push({
      display: 'New upload',
      route: '/new',
      exact: false,
    });
  }

  if (helpTabContents) {
    routes.push({
      display: 'My datasets help',
      route: '/help',
    });
  }

  return (
    <div>
      <WorkspaceNavigation
        heading={workspaceTitle}
        routeBase={baseUrl}
        items={routes}
      />
      <Switch>
        <WdkRoute
          exact
          requiresLogin
          path={baseUrl}
          component={() => (
            <UserDatasetListController
              baseUrl={baseUrl}
              hasDirectUpload={allowsUploads}
              helpRoute={helpRoute}
              workspaceTitle={workspaceTitle}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiConfig={vdiMetadata.serviceInfo.configuration}
            />
          )}
          disclaimerProps={{ toDoWhatMessage: 'To view your datasets' }}
        />
        {helpTabContents && (
          <WdkRoute
            requiresLogin={false}
            exact
            path={`${baseUrl}/help`}
            component={() => <>{helpTabContents}</>}
          />
        )}
        {allowsUploads && (
          <DatasetUploadRoute
            {...props}
            vdiConfig={vdiMetadata.serviceInfo}
            plugins={vdiMetadata.plugins}
            datasetTypes={datasetTypes}
            formConfigs={config.uploadFormConfigurators}
          />
        )}
        <Redirect to={baseUrl} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
