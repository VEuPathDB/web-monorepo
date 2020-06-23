import React from 'react';

import { Loading } from 'wdk-client/Components';

import { useOrthoService } from '../hooks/orthoServiceHook';
import { ClusterGraphDisplay } from '../components/cluster-graph/ClusterGraphDisplay';

interface Props {
  groupName: string;
}

export function GroupClusterGraphController({ groupName }: Props) {
  const layout = useOrthoService(
    orthoService => orthoService.getGroupLayout(groupName),
    [ groupName ]
  );

  return layout == null
    ? <Loading />
    : <ClusterGraphDisplay layout={layout} />;
}
