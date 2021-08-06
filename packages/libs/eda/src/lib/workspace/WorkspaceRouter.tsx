import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  Redirect,
} from 'react-router';
import { NewAnalysis } from './NewAnalysis';
import { EDAAnalysisList } from './EDAAnalysisList';
import { WorkspaceContainer } from './WorkspaceContainer';
import { mockAnalysisStore } from './Mocks';
import { SubsettingClient } from '../core/api/subsetting-api';
import { AllAnalyses } from './AllAnalyses';
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
  const subsettingClient = SubsettingClient.getClient(subsettingServiceUrl);

  return (
    <Switch>
      <Route
        path={path}
        exact
        render={() => (
          <AllAnalyses
            analysisClient={mockAnalysisStore}
            subsettingClient={subsettingClient}
          />
        )}
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
        exact
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <NewAnalysis
            {...props.match.params}
            analysisClient={mockAnalysisStore}
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
