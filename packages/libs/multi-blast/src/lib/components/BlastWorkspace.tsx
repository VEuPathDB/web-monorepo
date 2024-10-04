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
import { ReactNode } from 'react';

export const blastWorkspaceCx = makeClassNameHelper('BlastWorkspace');

interface Props {
  helpPageUrl: string;
  workspaceUrl: string;
  workspaceHeading?: ReactNode;
  workspaceShortName?: string;
}

export function BlastWorkspace(props: Props) {
  const {
    helpPageUrl,
    workspaceUrl,
    workspaceHeading = 'BLAST',
    workspaceShortName = 'BLAST',
  } = props;
  useSetDocumentTitle(`${workspaceShortName} Workspace`);

  return (
    <div className={blastWorkspaceCx()}>
      <WorkspaceNavigation
        heading={workspaceHeading}
        routeBase={workspaceUrl}
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
          path={workspaceUrl + '/new'}
          requiresLogin={false}
          component={BlastWorkspaceNew}
        />
        <WdkRoute
          path={workspaceUrl + '/all'}
          requiresLogin={false}
          component={BlastWorkspaceAll}
        />
        <WdkRoute
          path={workspaceUrl + '/help'}
          requiresLogin={false}
          component={() => {
            return <BlastWorkspaceHelp helpPageUrl={helpPageUrl} />;
          }}
        />
        <Redirect to={workspaceUrl + '/all'} />
      </Switch>
    </div>
  );
}
