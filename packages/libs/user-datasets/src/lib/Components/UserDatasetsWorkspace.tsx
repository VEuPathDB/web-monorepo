import { identity, isEmpty } from 'lodash';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Switch, Redirect } from 'react-router-dom';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { WorkspaceNavigationItem } from '@veupathdb/wdk-client/src/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { projectId } from '@veupathdb/web-common/lib/config';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

import {
  ClientDatasetTypeConfig,
  DatasetTypeConfig,
  UploadFormConfigurators,
  DatasetUploadRoute,
  filterAvailableDataTypes,
  promoteTypeConfig,
} from './Upload';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import { DataNoun } from '../Utils/types';
import {
  VdiPluginConfig,
  VdiServiceMetadata,
  VdiService,
  useVdiService,
} from '../Service';

export interface UserDatasetWorkspaceProps {
  readonly baseUrl: string;
  readonly helpRoute: string;
  readonly urlParams: Record<string, string>;
  readonly datasetTypes: readonly ClientDatasetTypeConfig[];
  readonly formConfigs: UploadFormConfigurators;
  readonly workspaceTitle: string;
  readonly helpTabContents?: ReactNode;
  readonly dataNoun: DataNoun;
  readonly enablePublicUserDatasets: boolean;
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

  const vdi = useVdiService<VdiService>(identity);

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
      display: 'All',
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
      display: 'Help',
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
        {allowsUploads && (
          <DatasetUploadRoute
            {...props}
            vdi={vdi!}
            vdiConfig={features}
            plugins={plugins}
            formConfigs={props.formConfigs}
            datasetTypes={datasetTypes}
          />
        )}
        {helpTabContents && (
          <WdkRoute
            requiresLogin={false}
            exact
            path={`${baseUrl}/help`}
            component={() => <>{helpTabContents}</>}
          />
        )}
        <Redirect to={baseUrl} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
