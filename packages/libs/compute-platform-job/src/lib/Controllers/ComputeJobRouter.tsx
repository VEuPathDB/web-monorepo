import { Route, Switch, useRouteMatch } from 'react-router';

import { ComputeJobPage } from '../Components/ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

interface Props {
  api: SequenceRetrievalApi;
}

export function ComputeJobRouter({ api }: Props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={path === '/' ? '/result/:jobId' : `${path}/result/:jobId`}
        exact
        render={(routeProps) => (
          <ComputeJobPage jobId={routeProps.match.params.jobId} api={api} />
        )}
      />
    </Switch>
  );
}
