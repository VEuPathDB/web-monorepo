import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { BlastWorkspace } from '../components/BlastWorkspace';
import { BlastWorkspaceResult } from '../components/BlastWorkspaceResult';
import { parseBlastResultSubpath } from '../utils/routes';

export function BlastWorkspaceRouter() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}/:tab(new|all|help)?`}
        exact
        component={BlastWorkspace}
      />
      <Route
        path={`${path}/result/:jobId/:subPath(combined|individual/\\d+)?`}
        exact
        component={(
          props: RouteComponentProps<{
            jobId: string;
            subPath: string | undefined;
          }>
        ) => {
          const selectedResult = parseBlastResultSubpath(
            props.match.params.subPath
          );

          return selectedResult != null && selectedResult.type === 'unknown' ? (
            <NotFoundController />
          ) : (
            <BlastWorkspaceResult
              jobId={props.match.params.jobId}
              selectedResult={selectedResult}
            />
          );
        }}
      />
    </Switch>
  );
}
