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
  const edaServiceUrl = '/eda-service';
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        path={path}
        exact
        render={() => <StudyList edaServiceUrl={edaServiceUrl} />}
      />
      <Route
        path={`${path}/:studyId`}
        exact
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <EDASessionList
            {...props.match.params}
            edaServiceUrl={edaServiceUrl}
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
            edaServiceUrl={edaServiceUrl}
          />
        )}
      />
    </Switch>
  );
}
