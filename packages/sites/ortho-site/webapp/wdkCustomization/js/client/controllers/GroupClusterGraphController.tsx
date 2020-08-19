import React from 'react';

import { Loading } from 'wdk-client/Components';

import { useCorePeripheralMap } from 'ortho-client/hooks/dataSummary';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';

import { ClusterGraphDisplay } from 'ortho-client/components/cluster-graph/ClusterGraphDisplay';

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
