import { Route, Switch, useLocation, useRouteMatch } from 'react-router';

import { ComputeJobPage } from '../Components/ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

interface Props {
  api: SequenceRetrievalApi;
}

// The result page opens in a new browser tab (window.open at submit time),
// which has no access to the submitting tab's React Router location.state —
// so paramsSummary/format travel as query params instead.
export function ComputeJobRouter({ api }: Props) {
  const { path } = useRouteMatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramsSummary = searchParams.get('paramsSummary') ?? undefined;
  const format = searchParams.get('format') ?? undefined;

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
            format={format}
          />
        )}
      />
    </Switch>
  );
}
