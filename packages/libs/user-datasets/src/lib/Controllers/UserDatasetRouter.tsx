import { ComponentType, ReactNode, useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DataNoun } from '../Utils/types';

import {
  ClientDatasetTypeConfig,
  UploadFormConfigurators,
} from '../Components/Upload';
import UserDatasetDetailController from './UserDatasetDetailController';
import { DetailViewProps } from '../Components/Detail/UserDatasetDetail';

interface Props {
  readonly datasetTypeConfigs: readonly ClientDatasetTypeConfig[];
  readonly uploadFormConfigurators: UploadFormConfigurators;
  readonly detailsPageTitle: string;
  readonly helpRoute: string;
  readonly workspaceTitle: string;
  readonly helpTabContents?: ReactNode;
  readonly detailComponentsByTypeName?: Record<
    string,
    ComponentType<DetailViewProps>
  >;
  readonly dataNoun: DataNoun;
  readonly enablePublicUserDatasets?: boolean;
}

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
              datasetTypes={datasetTypeConfigs}
              formConfigs={uploadFormConfigurators}
              helpRoute={helpRoute}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
            />
          );
        }}
      />
      <WdkRoute
        path={path + '/new/:type?'}
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
              datasetTypes={datasetTypeConfigs}
              formConfigs={uploadFormConfigurators}
              helpRoute={helpRoute}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
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
              datasetTypes={datasetTypeConfigs}
              formConfigs={uploadFormConfigurators}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
            />
          );
        }}
      />
      <WdkRoute
        path={`${path}/:id`}
        requiresLogin
        component={(props: RouteComponentProps<{ id: string }>) => {
          return (
            <UserDatasetDetailController
              baseUrl={url}
              detailsPageTitle={detailsPageTitle}
              workspaceTitle={workspaceTitle}
              detailComponentsByTypeName={detailComponentsByTypeName}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
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
