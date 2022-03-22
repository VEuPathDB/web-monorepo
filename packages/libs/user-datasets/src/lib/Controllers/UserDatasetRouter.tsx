import { useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router';

import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { makeDatasetUploadPageConfig } from '../Utils/upload-config';
import { DatasetUploadTypeConfig } from '../Utils/types';

import UserDatasetDetailController from './UserDatasetDetailController';

interface Props<T1 extends string = string, T2 extends string = string> {
  availableUploadTypes?: T1[];
  uploadTypeConfig: DatasetUploadTypeConfig<T2>;
}

export function UserDatasetRouter<T1 extends string, T2 extends string>({
  availableUploadTypes,
  uploadTypeConfig,
}: Props<T1, T2>) {
  const { path, url } = useRouteMatch();

  const uploadPageConfig = useMemo(
    () => makeDatasetUploadPageConfig(availableUploadTypes, uploadTypeConfig),
    [availableUploadTypes, uploadTypeConfig]
  );

  return (
    <Switch>
      <WdkRoute
        path={`${path}/:id(\\d+)`}
        requiresLogin
        component={(props: RouteComponentProps<{ id: string }>) => {
          return (
            <UserDatasetDetailController
              baseUrl={url}
              {...props.match.params}
            />
          );
        }}
      />
      <WdkRoute
        path={path}
        exact={false}
        requiresLogin={false} // uses custom guest views
        component={(props: RouteComponentProps<{}>) => (
          <UserDatasetsWorkspace
            baseUrl={url}
            uploadPageConfig={uploadPageConfig}
            // FIXME This should be memoized
            urlParams={parseQueryString(props)}
          />
        )}
      />
    </Switch>
  );
}
