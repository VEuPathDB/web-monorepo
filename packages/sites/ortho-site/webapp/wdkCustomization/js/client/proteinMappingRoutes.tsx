import React, { ContextType, Suspense } from 'react';
import { TargetMetadataByDataType } from '@veupathdb/multi-blast/lib/utils/targetTypes';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

const BlastWorkspaceRouter = React.lazy(
  () => import('./controllers/BlastWorkspaceRouter')
);

const targetMetadataByDataType: ContextType<typeof TargetMetadataByDataType> = {
  AnnotatedProteins: {
    recordClassUrlSegment: 'sequence',
    searchUrlSegment: 'MapProteinsByDiamond',
  },
};

export const proteinMappingRoutes: RouteEntry[] = [
  {
    path: '/workspace/map-proteins',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <TargetMetadataByDataType.Provider value={targetMetadataByDataType}>
          <BlastWorkspaceRouter workspaceHeading="Map proteins to OrthoMCL with Diamond blastp" />
        </TargetMetadataByDataType.Provider>
      </Suspense>
    ),
  },
];
