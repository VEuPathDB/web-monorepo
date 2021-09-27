import {
  PromiseHookState,
  PromiseResult,
  PublicAnalysisSummary,
} from '../core';

interface Props {
  state: PromiseHookState<PublicAnalysisSummary[]>;
}

export function PublicAnalyses({ state }: Props) {
  return (
    <div>
      <h1>Public Analyses</h1>
      <PromiseResult state={state}>
        {(publicAnalysisList) => (
          <pre>{JSON.stringify(publicAnalysisList, null, 2)}</pre>
        )}
      </PromiseResult>
    </div>
  );
}
