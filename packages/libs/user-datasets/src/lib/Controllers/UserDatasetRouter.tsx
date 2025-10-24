import { ComponentType, ReactNode, useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DatasetUploadPageConfig } from "../Utils/types";

import UserDatasetDetailController, { UserDatasetDetailProps } from './UserDatasetDetailController';
import { VariableDisplayText } from "../Components/FormTypes";

interface Props {
  readonly helpRoute: string;
  readonly helpTabContents?: ReactNode;
  readonly formConfig: DatasetUploadPageConfig,
  readonly displayText: VariableDisplayText;
  readonly detailComponentsByTypeName?: Record<string, ComponentType<UserDatasetDetailProps>>;
  readonly enablePublicUserDatasets?: boolean;
}

export function UserDatasetRouter({
  helpRoute,
  helpTabContents,
  formConfig,
  displayText,
  detailComponentsByTypeName,
  enablePublicUserDatasets = false,
}: Props) {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <WdkRoute
        path={path}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(props: RouteComponentProps) {
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
              uploadPageConfig={formConfig}
              urlParams={urlParams}
              displayText={displayText}
              helpTabContents={helpTabContents}
              enablePublicUserDatasets={enablePublicUserDatasets}
            />
          );
        }}
      />
      <WdkRoute
        path={path + '/new/:type?'}
        exact={true}
        requiresLogin={false} // uses custom guest views
        component={function UserDatasetsWorkspaceRoute(props: RouteComponentProps) {
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
              uploadPageConfig={formConfig}
              urlParams={urlParams}
              displayText={displayText}
              helpTabContents={helpTabContents}
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
              uploadPageConfig={formConfig}
              urlParams={urlParams}
              displayText={displayText}
              helpTabContents={helpTabContents}
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
              detailComponentsByTypeName={detailComponentsByTypeName}
              enablePublicUserDatasets={enablePublicUserDatasets}
              displayText={displayText}
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
