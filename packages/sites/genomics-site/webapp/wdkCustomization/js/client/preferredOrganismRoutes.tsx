import React, { Suspense } from 'react';

import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { PageLoading } from './components/common/PageLoading';

const PreferredOrganismsConfigController = React.lazy(
  () => import('./controllers/PreferredOrganismsConfigController')
);

export const preferredOrganismsRoutes: RouteEntry[] = [
  {
    path: '/preferred-organisms',
    component: () => (
      <Suspense fallback={<PageLoading />}>
        <PreferredOrganismsConfigController />
      </Suspense>
    ),
  },
];
