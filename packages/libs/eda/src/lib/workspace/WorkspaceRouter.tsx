import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  Redirect,
} from 'react-router';

import { SubsettingClient } from '../core/api/subsetting-api';
import { useConfiguredAnalysisClient } from '../core/hooks/analysisClient';
import { AllAnalyses } from './AllAnalyses';
import { EDAAnalysisList } from './EDAAnalysisList';
import { ImportAnalysis } from './ImportAnalysis';
import { LatestAnalysis } from './LatestAnalysis';
import { PublicAnalysesRoute } from './PublicAnalysesRoute';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';

type Props = {
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
  exampleAnalysesAuthor?: number;
};

export function WorkspaceRouter({
  subsettingServiceUrl,
  dataServiceUrl,
  userServiceUrl,
  exampleAnalysesAuthor,
}: Props) {
  const { path, url } = useRouteMatch();
  const subsettingClient = SubsettingClient.getClient(subsettingServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(userServiceUrl);

  return (
    <Switch>
      <Route
        path={path}
        exact
        render={() => (
          <AllAnalyses
            analysisClient={analysisClient}
            subsettingClient={subsettingClient}
            exampleAnalysesAuthor={exampleAnalysesAuthor}
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
        path={`${path}/studies`}
        exact
        render={() => (
          <StudyList
            baseUrl={url}
            subsettingServiceUrl={subsettingServiceUrl}
          />
        )}
      />
      <Route
        path={`${path}/public`}
        render={() => (
          <PublicAnalysesRoute
            analysisClient={analysisClient}
            exampleAnalysesAuthor={exampleAnalysesAuthor}
          />
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
            userServiceUrl={userServiceUrl}
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
            userServiceUrl={userServiceUrl}
          />
        )}
      />
      <Route
        path={`${path}/:studyId/~latest`}
        render={(props: RouteComponentProps<{ studyId: string }>) => (
          <LatestAnalysis
            {...props.match.params}
            replaceRegexp={/~latest/}
            analysisClient={analysisClient}
          />
        )}
      />
      <Route
        exact
        path={`${path}/:studyId/:analysisId/import/:ownerUserId`}
        render={(
          props: RouteComponentProps<{
            studyId: string;
            analysisId: string;
            ownerUserId: string;
          }>
        ) => (
          <ImportAnalysis
            {...props.match.params}
            analysisClient={analysisClient}
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
            userServiceUrl={userServiceUrl}
          />
        )}
      />
    </Switch>
  );
}
