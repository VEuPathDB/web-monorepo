import React, { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';

import {
  RouteComponentProps,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DataNoun } from '../Utils/types';

import DatasetManagementController from '../Components/Management/DatasetManagementController';
import { DetailViewProps } from '../Components/Management/DatasetManagement';
import {
  ClientDatasetTypeConfig,
  DatasetFormConfigurators,
  DatasetTypeConfig,
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
  detailComponentsByTypeName?: Record<string, ComponentType<DetailViewProps>>;
  dataNoun: DataNoun;
  enablePublicUserDatasets?: boolean;
}

export const UserDatasetRoutes = {
  NewDatasetSuffix: '/new/:type?',
  EditDatasetSuffix: '/:datasetId/edit',
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
        path={path + UserDatasetRoutes.NewDatasetSuffix}
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
        path={`${path}${UserDatasetRoutes.EditDatasetSuffix}`}
        exact={true}
        requiresLogin={true}
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps
        ) {
          const urlParams = useMemo(() => {
            const searchParamEntries = new URLSearchParams(
              props.location.search
            ).entries();

            return Object.fromEntries(searchParamEntries);
          }, [props.location.search]);

          const { datasetId } = useParams<{ datasetId: string }>();

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
              datasetId={datasetId}
            />
          );
        }}
      />
      <WdkRoute
        path={`${path}/:id`}
        requiresLogin
        component={function Component(props: RouteComponentProps<{ id: string }>) {
          const vdi = useVdiService<VdiService>(identity);

          const [plugins, setPlugins] = useState<readonly VdiPluginConfig[]>();
          const [features, setFeatures] = useState<VdiServiceMetadata>();

          useEffect(() => {
            vdi?.getPluginList(projectId)?.then(setPlugins);
            vdi?.getServiceMetadata()?.then(setFeatures);
          }, [vdi]);

          if (!Array.isArray(plugins) || !features) return <Loading />;

          const datasetTypes = datasetTypeConfigs
            ?.map((cdt) => promoteTypeConfig(cdt, plugins))
            ?.filter((v) => v !== undefined) as readonly DatasetTypeConfig[];

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
              {...props.match.params}
            />
          );
        }}
      />
    </Switch>
  );
}
