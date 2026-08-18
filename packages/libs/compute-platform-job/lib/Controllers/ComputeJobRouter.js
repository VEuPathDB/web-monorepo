import { jsx as _jsx } from 'react/jsx-runtime';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import { ComputeJobPage } from '../Components/ComputeJobPage';
// The result page opens in a new browser tab (window.open at submit time),
// which has no access to the submitting tab's React Router location.state —
// so paramsSummary/format travel as query params instead.
export function ComputeJobRouter({ api }) {
  var _a, _b;
  const { path } = useRouteMatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramsSummary =
    (_a = searchParams.get('paramsSummary')) !== null && _a !== void 0
      ? _a
      : undefined;
  const format =
    (_b = searchParams.get('format')) !== null && _b !== void 0
      ? _b
      : undefined;
  return _jsx(Switch, {
    children: _jsx(Route, {
      path: path === '/' ? '/result/:jobId' : `${path}/result/:jobId`,
      exact: true,
      render: (routeProps) =>
        _jsx(ComputeJobPage, {
          jobId: routeProps.match.params.jobId,
          api: api,
          paramsSummary: paramsSummary,
          format: format,
        }),
    }),
  });
}
//# sourceMappingURL=ComputeJobRouter.js.map
