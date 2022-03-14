import { RouteComponentProps, Switch, useRouteMatch } from 'react-router';

import { parseQueryString } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';

import UserDatasetDetailController from './UserDatasetDetailController';

interface Props {
  rootUrl: string;
}

export function UserDatasetRouter({ rootUrl }: Props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <WdkRoute
        path={`${path}/:id(\\d+)`}
        requiresLogin
        component={(props: RouteComponentProps<{ id: string }>) => {
          // FIXME Remove this requirement from the component by updating action creators
          const rootUrl = window.location.origin;

          return (
            <UserDatasetDetailController
              {...props.match.params}
              rootUrl={rootUrl}
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
            rootPath={props.match.path}
            urlParams={parseQueryString(props)}
          />
        )}
      />
    </Switch>
  );
}
