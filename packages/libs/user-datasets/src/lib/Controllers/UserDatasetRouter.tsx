import { ComponentType, ReactNode, useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { makeDatasetUploadPageConfig } from '../Utils/upload-config';
import { DatasetUploadTypeConfig, DataNoun } from '../Utils/types';

import UserDatasetDetailController, {
  UserDatasetDetailProps,
} from './UserDatasetDetailController';

interface Props<T1 extends string = string, T2 extends string = string> {
  availableUploadTypes?: T1[];
  detailsPageTitle: string;
  helpRoute: string;
  uploadTypeConfig: DatasetUploadTypeConfig<T2>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  detailComponentsByTypeName?: Record<
    string,
    ComponentType<UserDatasetDetailProps>
  >;
  dataNoun: DataNoun;
  enablePublicUserDatasets?: boolean;
}

export function UserDatasetRouter<T1 extends string, T2 extends string>({
  availableUploadTypes,
  detailsPageTitle,
  helpRoute,
  uploadTypeConfig,
  workspaceTitle,
  helpTabContents,
  detailComponentsByTypeName,
  dataNoun,
  enablePublicUserDatasets = false,
}: Props<T1, T2>) {
  const { path, url } = useRouteMatch();

  const uploadPageConfig = useMemo(
    () => makeDatasetUploadPageConfig(availableUploadTypes, uploadTypeConfig),
    [availableUploadTypes, uploadTypeConfig]
  );

  return (
    <Switch>
      <WdkRoute
        path={path}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps<{}>
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
              uploadPageConfig={uploadPageConfig}
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
        path={path + '/new'}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps<{}>
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
              uploadPageConfig={uploadPageConfig}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
            />
          );
        }}
      />
      {/* <WdkRoute
        path={path + '/recent'}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps<{}>
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
              uploadPageConfig={uploadPageConfig}
              urlParams={urlParams}
              workspaceTitle={workspaceTitle}
              helpTabContents={helpTabContents}
              dataNoun={dataNoun}
            />
          );
        }}
      /> */}
      <WdkRoute
        path={path + '/help'}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(
          props: RouteComponentProps<{}>
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
              uploadPageConfig={uploadPageConfig}
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
