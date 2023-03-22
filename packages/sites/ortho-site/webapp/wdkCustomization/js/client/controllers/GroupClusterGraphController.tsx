import React from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { useCorePeripheralMap } from 'ortho-client/hooks/dataSummary';
import { useOrthoService } from 'ortho-client/hooks/orthoService';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';

import { ClusterGraphDisplay } from 'ortho-client/components/cluster-graph/ClusterGraphDisplay';

interface Props {
  groupName: string;
}

export function GroupClusterGraphController({ groupName }: Props) {
  useSetDocumentTitle(`Cluster Graph - ${groupName}`);

  const corePeripheralMap = useCorePeripheralMap();

  const layoutResponse = useOrthoService(
    orthoService => orthoService.getGroupLayout(groupName),
    [ groupName ]
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  return corePeripheralMap == null || layoutResponse == null || taxonUiMetadata == null
    ? <Loading />
    : layoutResponse.layoutOffered === false
    ? <div>
        <h1>Cluster Graph Unavailable for {groupName}</h1>
        <p>Cluster graph is available for ortholog groups of 2 to 499 proteins.</p>
      </div>
    : <ClusterGraphDisplay
        corePeripheralMap={corePeripheralMap}
        groupName={groupName}
        layout={layoutResponse}
        taxonUiMetadata={taxonUiMetadata}
      />;
}
