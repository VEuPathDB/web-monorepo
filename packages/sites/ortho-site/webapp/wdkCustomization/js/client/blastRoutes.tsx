import React, { ContextType, Suspense } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

const BlastWorkspaceRouter = React.lazy(
  () => import('./controllers/BlastWorkspaceRouter')
);

import { TargetMetadataByDataType } from '@veupathdb/multi-blast/lib/utils/targetTypes';
import { communitySite } from '@veupathdb/web-common/lib/config';

const targetMetadataByDataType: ContextType<typeof TargetMetadataByDataType> = {
  AnnotatedProteins: {
    recordClassUrlSegment: 'sequence',
    searchUrlSegment: 'ByMultiBlast',
  },
};

export const blastRoutes: RouteEntry[] = [
  {
    path: '/workspace/blast',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <TargetMetadataByDataType.Provider value={targetMetadataByDataType}>
          <BlastWorkspaceRouter
            helpPageUrl={communitySite + 'multiblast.html'}
          />
        </TargetMetadataByDataType.Provider>
      </Suspense>
    ),
  },
  {
    path: '/search/:recordClass/:searchName(.*MultiBlast)',
    component: (
      props: RouteComponentProps<{
        recordClass: string;
      }>
    ) => (
      <Redirect
        to={`/workspace/blast/new?recordType=${props.match.params.recordClass}`}
      />
    ),
  },
];
