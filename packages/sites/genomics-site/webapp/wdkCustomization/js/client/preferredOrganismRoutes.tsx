import React, { Suspense } from 'react';

import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { PreferredOrganismsConfigController } from '@veupathdb/preferred-organisms/lib/controllers/PreferredOrganismsConfigController';

export const preferredOrganismsRoutes: RouteEntry[] = [
  {
    path: '/preferred-organisms',
    component: () => (
      <Suspense fallback={null}>
        <PreferredOrganismsConfigController />
      </Suspense>
    ),
  },
];
