import { Route, Switch, useRouteMatch } from 'react-router';

import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';

import { BlastWorkspace } from '../components/BlastWorkspace';
import { BlastWorkspaceResult } from '../components/BlastWorkspaceResult';
import { ReactNode } from 'react';

interface Props {
  workspaceHeading?: ReactNode;
}

export function BlastWorkspaceRouter(props: Props) {
  const { path, url } = useRouteMatch();
  const { workspaceHeading } = props;

  return (
    <Switch>
      <Route
        path={`${path}/:tab(new|all|help)?`}
        exact
        render={() => (
          <BlastWorkspace
            workspaceUrl={url}
            workspaceHeading={workspaceHeading}
          />
        )}
      />
      <Route
        path={`${path}/result/:jobId/combined`}
        exact
        render={(props) => {
          const jobId = props.match.params.jobId as string;

          return (
            <BlastWorkspaceResult
              jobId={jobId}
              selectedResult={{ type: 'combined' }}
            />
          );
        }}
      />
      <Route
        path={`${path}/result/:jobId/individual/:resultIndex(\\d+)`}
        exact
        render={(props) => {
          const jobId = props.match.params.jobId as string;
          const resultIndex = Number(props.match.params.resultIndex as string);

          return (
            <BlastWorkspaceResult
              jobId={jobId}
              selectedResult={{
                type: 'individual',
                resultIndex,
              }}
            />
          );
        }}
      />
      <Route
        path={`${path}/result/:jobId`}
        exact
        render={(props) => {
          const jobId = props.match.params.jobId as string;

          return (
            <BlastWorkspaceResult jobId={jobId} selectedResult={undefined} />
          );
        }}
      />
      <Route component={NotFoundController} />
    </Switch>
  );
}
