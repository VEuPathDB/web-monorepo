import { Route, Switch, useLocation, useRouteMatch } from 'react-router';

import { ComputeJobPage } from '../Components/ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

interface Props {
  api: SequenceRetrievalApi;
}

interface LocationState {
  paramsSummary?: string;
}

function isLocationState(state: unknown): state is LocationState {
  return (
    state != null &&
    typeof state === 'object' &&
    (!('paramsSummary' in state) ||
      typeof (state as LocationState).paramsSummary === 'string')
  );
}

export function ComputeJobRouter({ api }: Props) {
  const { path } = useRouteMatch();
  const location = useLocation<unknown>();
  const paramsSummary = isLocationState(location.state)
    ? location.state.paramsSummary
    : undefined;

  return (
    <Switch>
      <Route
        path={path === '/' ? '/result/:jobId' : `${path}/result/:jobId`}
        exact
        render={(routeProps) => (
          <ComputeJobPage
            jobId={routeProps.match.params.jobId}
            api={api}
            paramsSummary={paramsSummary}
          />
        )}
      />
    </Switch>
  );
}
