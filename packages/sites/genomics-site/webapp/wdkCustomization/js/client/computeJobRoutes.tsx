import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { ComputeJobRouter } from '@veupathdb/compute-platform-job/src/lib/Controllers/ComputeJobRouter';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';

// TODO: confirm the actual deployed base URL for service-sequence-retrieval
// with the team before this ships — this is a placeholder host.
const SEQUENCE_RETRIEVAL_BASE_URL = 'https://sequence-retrieval.example.org';

function ComputeJobRouterContainer() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const api = SequenceRetrievalApi.getClient(
    SEQUENCE_RETRIEVAL_BASE_URL,
    wdkService
  );

  return <ComputeJobRouter api={api} />;
}

export const computeJobRoutes: RouteEntry[] = [
  {
    path: '/workspace/msa',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <ComputeJobRouterContainer />
      </Suspense>
    ),
  },
];
