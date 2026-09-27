import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { ComputeJobRouter } from '@veupathdb/compute-platform-job/src/lib/Controllers/ComputeJobRouter';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';

import { SEQUENCE_RETRIEVAL_BASE_URL } from './util/computeJobConfig';

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
