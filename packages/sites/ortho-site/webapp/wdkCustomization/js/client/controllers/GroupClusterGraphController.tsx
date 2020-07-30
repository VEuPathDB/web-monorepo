import React from 'react';

import { Loading } from 'wdk-client/Components';

import { useCorePeripheralMap } from '../hooks/dataSummary';
import { useOrthoService } from '../hooks/orthoService';
import { useTaxonUiMetadata } from '../hooks/taxons';

import { ClusterGraphDisplay } from '../components/cluster-graph/ClusterGraphDisplay';

interface Props {
  groupName: string;
}

export function GroupClusterGraphController({ groupName }: Props) {
  const corePeripheralMap = useCorePeripheralMap();

  const layout = useOrthoService(
    orthoService => orthoService.getGroupLayout(groupName),
    [ groupName ]
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  return corePeripheralMap == null || layout == null || taxonUiMetadata == null
    ? <Loading />
    : <ClusterGraphDisplay
        corePeripheralMap={corePeripheralMap}
        groupName={groupName}
        layout={layout}
        taxonUiMetadata={taxonUiMetadata}
      />;
}
