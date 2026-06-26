import React, { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';

import { RouteComponentProps, Switch, useHistory, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DataNoun } from '../Utils/types';

import DatasetManagementController from '../Components/Management/DatasetManagementController';
import { DatasetManagementProps } from '../Components/Management/DatasetManagement';
import {
  ClientDatasetTypeConfig,
  DatasetFormConfigurators,
  DatasetTypeConfig, filterAvailableDataTypes,
  promoteTypeConfig
} from '../Common/Configuration';
import { useVdiService, VdiPluginConfig, VdiService, VdiServiceMetadata } from '../Service';
import { identity } from 'lodash';
import { projectId } from '../config';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  readonly datasetTypeConfigs: readonly ClientDatasetTypeConfig[];
  uploadFormConfigurators: DatasetFormConfigurators;
  detailsPageTitle: string;
  helpRoute: string;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  detailComponentsByTypeName?: Record<string, ComponentType<DatasetManagementProps>>;
  dataNoun: DataNoun;
  enablePublicUserDatasets?: boolean;
}

export const UserDatasetRoutes = {
  NewDataset: '/new/:type?',
  ManageDataset: '/:id',
  EditDataset: '/:id/edit',
} as const;

export function UserDatasetRouter({
  datasetTypeConfigs,
  uploadFormConfigurators,
  detailsPageTitle,
  helpRoute,
  workspaceTitle,
  helpTabContents,
  detailComponentsByTypeName,
  dataNoun,
  enablePublicUserDatasets = false,
}: Props) {
  const { path, url } = useRouteMatch();

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
              formConfigs={uploadFormConfigurators}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              datasetTypes={datasetTypeConfigs}
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
              formConfigs={uploadFormConfigurators}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              datasetTypes={datasetTypeConfigs}
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
              formConfigs={uploadFormConfigurators}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
              datasetTypes={datasetTypeConfigs}
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
          const vdi = useVdiService();

          const history = useHistory();

          const [plugins, setPlugins] = useState<readonly VdiPluginConfig[]>();
          const [features, setFeatures] = useState<VdiServiceMetadata>();

          useEffect(() => {
            vdi?.getPluginList(projectId)?.then(setPlugins);
            vdi?.getServiceMetadata()?.then(setFeatures);
          }, [vdi]);

          if (!Array.isArray(plugins) || !features)
            return <Loading />;

          const datasetTypes = filterAvailableDataTypes(datasetTypeConfigs, plugins)
            .map((cdt) => promoteTypeConfig(cdt, plugins))
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
              formConfigs={uploadFormConfigurators}
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
