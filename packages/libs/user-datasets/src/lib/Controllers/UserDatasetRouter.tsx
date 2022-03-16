import { RouteComponentProps, Switch, useRouteMatch } from 'react-router';

import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import UserDatasetDetailController from './UserDatasetDetailController';

interface Props {
  hasDirectUpload: boolean;
}

export function UserDatasetRouter({ hasDirectUpload }: Props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <WdkRoute
        path={`${path}/:id(\\d+)`}
        requiresLogin
        component={(props: RouteComponentProps<{ id: string }>) => {
          return <UserDatasetDetailController {...props.match.params} />;
        }}
      />
      <WdkRoute
        path={path}
        exact={false}
        requiresLogin={false} // uses custom guest views
        component={(props: RouteComponentProps<{}>) => (
          <UserDatasetsWorkspace
            hasDirectUpload={hasDirectUpload}
            baseUrl={path}
            urlParams={parseQueryString(props)}
          />
        )}
      />
    </Switch>
  );
}
