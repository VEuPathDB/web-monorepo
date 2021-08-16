import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  Redirect,
} from 'react-router';
import { EDAAnalysisList } from './EDAAnalysisList';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';
import { mockAnalysisStore } from './Mocks';
import { LatestAnalysis } from './LatestAnalysis';

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
      {/* replacing/redirecting double slashes url with single slash one */}
      <Route
        exact
        strict
        path="(.*//+.*)"
        render={({ location }) => (
          <Redirect to={location.pathname.replace(/\/\/+/g, '/')} />
        )}
      />
      <Route
        path={`${path}/:studyId`}
        exact
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <EDAAnalysisList
            {...props.match.params}
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
          />
        )}
      />
      <Route
        path={`${path}/:studyId/new`}
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <WorkspaceContainer
            {...props.match.params}
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
          />
        )}
      />
      <Route
        path={`${path}/:studyId/~latest`}
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <LatestAnalysis
            {...props.match.params}
            replaceRegexp={/~latest/}
            analysisClient={mockAnalysisStore}
          />
        )}
      />
      <Route
        path={`${path}/:studyId/:analysisId`}
        render={(
          props: RouteComponentProps<{ studyId: string; analysisId: string }>
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
