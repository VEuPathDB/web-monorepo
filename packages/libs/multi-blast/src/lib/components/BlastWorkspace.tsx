import { Redirect, Switch } from 'react-router';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { BlastWorkspaceNew } from './BlastWorkspaceNew';

import './BlastWorkspace.scss';

export const blastWorkspaceCx = makeClassNameHelper('BlastWorkspace');

export function BlastWorkspace() {
  return (
    <div className={blastWorkspaceCx()}>
      <WorkspaceNavigation
        heading="BLAST"
        routeBase="/workspace/blast"
        items={[
          {
            display: 'New job',
            route: '/new',
          },
          {
            display: 'All jobs',
            route: '/all',
          },
          {
            display: 'Help',
            route: '/help',
          },
        ]}
      />
      <Switch>
        <WdkRoute
          path="/workspace/blast/new"
          requiresLogin={false}
          component={BlastWorkspaceNew}
        />
        <WdkRoute
          path="/workspace/blast/all"
          requiresLogin={false}
          component={UnderConstruction}
        />
        <WdkRoute
          path="/workspace/blast/help"
          requiresLogin={false}
          component={UnderConstruction}
        />
        <Redirect to="/workspace/blast/new" />
      </Switch>
    </div>
  );
}

export function UnderConstruction() {
  return <p style={{ fontSize: '1.2em' }}>Under Construction</p>;
}
