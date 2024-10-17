import React, { Suspense } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { communitySite } from '@veupathdb/web-common/lib/config';

const BlastWorkspaceRouter = React.lazy(
  () => import('./controllers/BlastWorkspaceRouter')
);

export const blastRoutes: RouteEntry[] = [
  {
    path: '/workspace/blast',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <BlastWorkspaceRouter helpPageUrl={communitySite + 'multiblast.html'} />
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
