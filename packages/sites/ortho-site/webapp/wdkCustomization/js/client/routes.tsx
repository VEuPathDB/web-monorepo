import React from 'react';

import { RouteComponentProps } from 'react-router';

import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import SiteSearchController from '@veupathdb/web-common/lib/controllers/SiteSearchController';

import { OrthoMCLHomePageController } from 'ortho-client/controllers/OrthoMCLHomePageController';
import { ProteomeSummaryController } from 'ortho-client/controllers/ProteomeSummaryController';
import { GroupClusterGraphController } from 'ortho-client/controllers/GroupClusterGraphController';

export function wrapRoutes(ebrcRoutes: RouteEntry[]): RouteEntry[] {
  return [
    {
      path: '/',
      component: OrthoMCLHomePageController,
      rootClassNameModifier: 'home-page',
    },
    {
      path: '/cluster-graph/:groupName',
      component: (props: RouteComponentProps<{ groupName: string }>) => {
        const groupName = props.match.params.groupName;

        return <GroupClusterGraphController groupName={groupName} />;
      },
    },
    {
      path: '/release-summary',
      component: ProteomeSummaryController,
    },
    {
      path: '/search',
      component: () => <SiteSearchController offerOrganismFilter={false} />,
    },
    ...ebrcRoutes,
  ];
}
