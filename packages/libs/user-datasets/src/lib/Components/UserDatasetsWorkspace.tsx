import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { identity, isEmpty } from 'lodash';
import { Switch, Redirect } from 'react-router-dom';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { WorkspaceNavigationItem } from '@veupathdb/wdk-client/src/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { projectId } from '../config';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { DatasetUploadRoute } from './Upload';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import { DataNoun } from '../Utils/types';
import {
  VdiPluginConfig,
  VdiServiceMetadata,
  VdiService,
  useVdiService,
} from '../Service';
import {
  ClientDatasetTypeConfig,
  DatasetFormConfigurators,
  DatasetTypeConfig,
  filterAvailableDataTypes,
  promoteTypeConfig
} from '../Common/Configuration';

export interface UserDatasetWorkspaceProps {
  baseUrl: string;
  helpRoute: string;
  urlParams: Record<string, string>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;

  readonly datasetTypes: readonly ClientDatasetTypeConfig[];
  readonly formConfigs: DatasetFormConfigurators;
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
  } = props;

  const vdi = useVdiService();

  const [plugins, setPlugins] = useState<readonly VdiPluginConfig[]>();
  const [features, setFeatures] = useState<VdiServiceMetadata>();

  useEffect(() => {
    vdi?.getPluginList(projectId)?.then(setPlugins);
    vdi?.getServiceMetadata()?.then(setFeatures);
  }, [vdi]);

  if (!Array.isArray(plugins) || !features) return <Loading />;

  const datasetTypes = props.datasetTypes
    .map((cdt) => promoteTypeConfig(cdt, plugins))
    .filter((v) => v !== undefined) as readonly DatasetTypeConfig[];

  const availableDataTypes = filterAvailableDataTypes(datasetTypes, plugins);
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
              vdiConfig={features!.configuration}
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
            vdi={vdi!}
            vdiConfig={features}
            plugins={plugins}
            datasetTypes={datasetTypes}
          />
        )}
        <Redirect to={baseUrl} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
