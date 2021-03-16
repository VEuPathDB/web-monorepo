import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';
import { EDASessionList } from './EDASessionList';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';

type Props = {
  subsettingServiceUrl: string;
  dataServiceUrl: string;
};

export function WorkspaceRouter({
  subsettingServiceUrl,
  dataServiceUrl,
}: Props) {
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
