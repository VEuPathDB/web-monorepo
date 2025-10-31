import { ComponentType, ReactNode, useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router-dom';

import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { DatasetUploadPageConfig } from "../Utils/types";

import UserDatasetDetailController, { UserDatasetDetailProps } from './UserDatasetDetailController';
import { newDefaultedDisplayText } from "../Components";
import { useWdkService } from "@veupathdb/wdk-client/lib/Hooks/WdkServiceHook";
import { isVdiCompatibleWdkService } from "../Service";

interface Props {
  readonly helpRoute: string;
  readonly helpTabContents?: ReactNode;
  readonly formConfig: DatasetUploadPageConfig,
  readonly detailComponentsByTypeName?: Record<string, ComponentType<UserDatasetDetailProps>>;
  readonly enablePublicUserDatasets?: boolean;
}

export function UserDatasetRouter({
  helpRoute,
  helpTabContents,
  formConfig,
  detailComponentsByTypeName,
  enablePublicUserDatasets = false,
}: Props) {
  const { path, url } = useRouteMatch();

  const vdi = useWdkService(
    async wdk => isVdiCompatibleWdkService(wdk)
      ? await wdk.vdiService.getServiceMetadata()
      : undefined
  )?.configuration;

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
              helpTabContents={helpTabContents}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiConfig={vdi!!}
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
              helpTabContents={helpTabContents}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiConfig={vdi!!}
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
              helpTabContents={helpTabContents}
              enablePublicUserDatasets={enablePublicUserDatasets}
              vdiConfig={vdi!!}
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
              displayText={newDefaultedDisplayText()}
              vdiConfig={vdi!!}
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
