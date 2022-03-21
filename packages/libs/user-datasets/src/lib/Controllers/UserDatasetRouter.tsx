import { useMemo } from 'react';

import { RouteComponentProps, Switch, useRouteMatch } from 'react-router';

import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import { isDirectUploadAvailable } from '../Utils/upload-config';

import UserDatasetDetailController from './UserDatasetDetailController';

interface Props {
  availableUploadTypes?: string[];
}

export function UserDatasetRouter({ availableUploadTypes }: Props) {
  const { path, url } = useRouteMatch();

  const uploadPageConfig = useMemo(
    () => isDirectUploadAvailable(availableUploadTypes),
    [availableUploadTypes]
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
