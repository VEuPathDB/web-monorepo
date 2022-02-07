import { Redirect, Switch } from 'react-router';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import {
  makeClassNameHelper,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { BlastWorkspaceAll } from './BlastWorkspaceAll';
import { BlastWorkspaceHelp } from './BlastWorkspaceHelp';
import { BlastWorkspaceNew } from './BlastWorkspaceNew';

import './BlastWorkspace.scss';

export const blastWorkspaceCx = makeClassNameHelper('BlastWorkspace');

export function BlastWorkspace() {
  useSetDocumentTitle('BLAST Workspace');

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
            display: 'My jobs',
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
          component={BlastWorkspaceAll}
        />
        <WdkRoute
          path="/workspace/blast/help"
          requiresLogin={false}
          component={BlastWorkspaceHelp}
        />
        <Redirect to="/workspace/blast/all" />
      </Switch>
    </div>
  );
}
