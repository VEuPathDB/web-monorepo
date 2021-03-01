import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';
import { EDASessionList } from './EDASessionList';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';

export function WorkspaceRouter() {
  const subsettingServiceUrl = '/eda-subsetting-service';
  const dataServiceUrl = '/eda-data-service';
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        path={path}
        exact
        render={() => <StudyList subsettingServiceUrl={subsettingServiceUrl} />}
      />
      <Route
        path={`${path}/:studyId`}
        exact
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <EDASessionList
            {...props.match.params}
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
          />
        )}
      />
      <Route
        path={`${path}/:studyId/:sessionId`}
        exact
        render={(
          props: RouteComponentProps<{ studyId: string; sessionId: string }>
        ) => (
          <WorkspaceContainer
            {...props.match.params}
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
          />
        )}
      />
    </Switch>
  );
}
