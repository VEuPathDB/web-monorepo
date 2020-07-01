import React from 'react';

import { Loading } from 'wdk-client/Components';

import { useOrthoService } from '../hooks/orthoService';
import { useTaxonUiMetadata } from '../hooks/taxons';

import { ClusterGraphDisplay } from '../components/cluster-graph/ClusterGraphDisplay';

interface Props {
  groupName: string;
}

export function GroupClusterGraphController({ groupName }: Props) {
  const layout = useOrthoService(
    orthoService => orthoService.getGroupLayout(groupName),
    [ groupName ]
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  useEffect(() => {
    if (layout != null) {
      console.log(layout);
    }
  }, [ layout ]);

  return layout == null || taxonUiMetadata == null
    ? <Loading />
    : <ClusterGraphDisplay layout={layout} taxonUiMetadata={taxonUiMetadata} />;
}
