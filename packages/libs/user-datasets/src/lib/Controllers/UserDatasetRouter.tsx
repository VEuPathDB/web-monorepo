import React, { ComponentType, ReactNode, useMemo } from 'react';

import { RouteComponentProps, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DataNoun } from '../Utils/types';

import DatasetManagementController from '../Components/Management/DatasetManagementController';
import { DatasetManagementProps } from '../Components/Management/DatasetManagement';
import {
  DatasetTypeConfig,
  filterAvailableDataTypes,
  promoteTypeConfig
} from '../Common/Configuration';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useVdiMetadata } from '../Service/utils/use-vdi';
import { DatasetWorkspaceConfig } from '../Common/Configuration/DatasetWorkspaceConfig';

interface Props {
  detailsPageTitle: string;
  helpRoute: string;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  detailComponentsByTypeName?: Record<string, ComponentType<DatasetManagementProps>>;
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
  detailComponentsByTypeName,
  dataNoun,
  enablePublicUserDatasets = false,
}: Props) {
  const { path, url } = useRouteMatch();

  const vdiMetadata = useVdiMetadata();

  if (!vdiMetadata)
    return <Loading />;

  return (
    <Switch>
      <WdkRoute
        path={path}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps
        ) {
          const urlParams = useMemo(() => {
            const searchParamEntries = new URLSearchParams(
              props.location.search
            ).entries();

            return Object.fromEntries(searchParamEntries);
          }, [props.location.search]);

          return (
            <UserDatasetsWorkspace
              baseUrl={url}
              helpRoute={helpRoute}
              workspaceConfig={workspaceConfig}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiMetadata={vdiMetadata}
            />
          );
        }}
      />
      <WdkRoute
        path={path + UserDatasetRoutes.NewDataset}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps
        ) {
          const urlParams = useMemo(() => {
            const searchParamEntries = new URLSearchParams(
              props.location.search
            ).entries();

            return Object.fromEntries(searchParamEntries);
          }, [props.location.search]);

          return (
            <UserDatasetsWorkspace
              baseUrl={url}
              helpRoute={helpRoute}
              workspaceConfig={workspaceConfig}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiMetadata={vdiMetadata}
            />
          );
        }}
      />
      <WdkRoute
        path={path + '/help'}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps
        ) {
          const urlParams = useMemo(() => {
            const searchParamEntries = new URLSearchParams(
              props.location.search
            ).entries();

            return Object.fromEntries(searchParamEntries);
          }, [props.location.search]);

          return (
            <UserDatasetsWorkspace
              baseUrl={url}
              helpRoute={helpRoute}
              workspaceConfig={workspaceConfig}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiMetadata={vdiMetadata}
            />
          );
        }}
      />
      <WdkRoute
        path={[
          path + UserDatasetRoutes.ManageDataset,
          path + UserDatasetRoutes.EditDataset,
        ]}
        exact={true}
        requiresLogin={true}
        component={function Component(props: RouteComponentProps<{ id: string }>) {
          const history = useHistory();

          const datasetTypes = filterAvailableDataTypes(workspaceConfig.baseDatasetTypeConfigs, vdiMetadata.plugins)
            .map((cdt) => promoteTypeConfig(cdt, vdiMetadata.plugins))
            .filter((v) => v !== undefined) as readonly DatasetTypeConfig[];

          const editModalProps = props.location.pathname.endsWith("/edit")
            ? {
              showModal: true,
              updateToPublic: props.location.search.indexOf("updateToPublic") > -1
            }
            : undefined;

          return (
            <DatasetManagementController
              baseUrl={url}
              detailsPageTitle={detailsPageTitle}
              workspaceTitle={workspaceTitle}
              detailComponentsByTypeName={detailComponentsByTypeName}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              datasetTypes={datasetTypes}
              formConfigs={workspaceConfig.uploadFormConfigurators}
              fetchEdaStudyLinks={workspaceConfig.fetchEdaStudyMetadata}
              includeAllLink
              includeNameHeader
              editModal={editModalProps}
              history={history}
              {...props.match.params}
            />
          );
        }}
      />
    </Switch>
  );
}
