import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import { Redirect, Switch } from 'react-router';

export function BlastWorkspace() {
  return (
    <>
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
          component={UnderConstruction}
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
    </>
  );
}

function UnderConstruction() {
  return <div>Under Construction</div>;
}
