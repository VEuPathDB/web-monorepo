import React from 'react';

import { RouteComponentProps } from 'react-router';

import { RouteEntry } from 'wdk-client/Core/RouteEntry';

import SiteSearchController from 'ebrc-client/controllers/SiteSearchController';

import { GenomeSourcesController } from 'ortho-client/controllers/GenomeSourcesController';
import { GenomeStatisticsController } from 'ortho-client/controllers/GenomeStatisticsController';
import { OrthoMCLHomePageController } from 'ortho-client/controllers/OrthoMCLHomePageController';
import { GroupClusterGraphController } from 'ortho-client/controllers/GroupClusterGraphController';

export function wrapRoutes(ebrcRoutes: RouteEntry[]): RouteEntry[] {
  return [
    {
      path: '/',
      component: OrthoMCLHomePageController,
      rootClassNameModifier: 'home-page'
    },
    // TODO: Delete this route once the initial implementation
    // TODO: of the cluster graph is complete
    {
      path: '/cluster-graph/:groupName',
      component: (props: RouteComponentProps<{ groupName: string }>) => {
        const groupName = props.match.params.groupName;

        return <GroupClusterGraphController groupName={groupName} />;
      }
    },
    {
      path: '/genome-statistics',
      component: GenomeStatisticsController
    },
    {
      path: '/genome-sources',
      component: GenomeSourcesController,
    },
    {
      path: '/search',
      component: SiteSearchController
    },
    ...ebrcRoutes
  ];
}
