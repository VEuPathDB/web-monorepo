import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';
import { EDAAnalysisList } from './EDAAnalysisList';
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
          <EDAAnalysisList
            {...props.match.params}
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
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
