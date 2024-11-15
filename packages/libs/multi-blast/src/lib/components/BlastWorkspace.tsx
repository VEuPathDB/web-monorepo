import { Redirect, Switch } from 'react-router';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import {
  makeClassNameHelper,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { BlastWorkspaceAll } from './BlastWorkspaceAll';
import { BlastWorkspaceHelp } from './BlastWorkspaceHelp';
import { BlastWorkspaceNew, BlastWorkspaceNewProps } from './BlastWorkspaceNew';

import './BlastWorkspace.scss';
import { ReactNode } from 'react';

export const blastWorkspaceCx = makeClassNameHelper('BlastWorkspace');

interface Props {
  helpPageUrl: string;
  workspaceUrl: string;
  workspaceHeading?: ReactNode;
  workspaceShortName?: string;
  submitButtonText?: string;
}

export function BlastWorkspace(props: Props) {
  const {
    helpPageUrl,
    workspaceUrl,
    workspaceHeading = 'My BLAST Jobs',
    workspaceShortName = 'BLAST',
    submitButtonText = 'BLAST',
  } = props;
  useSetDocumentTitle(`${workspaceShortName} Workspace`);

  return (
    <div className={blastWorkspaceCx()}>
      <WorkspaceNavigation
        heading={workspaceHeading}
        routeBase={workspaceUrl}
        items={[
          {
            display: 'All',
            route: '/all',
          },
          {
            display: 'New job',
            route: '/new',
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
          component={(props: BlastWorkspaceNewProps) => (
            <BlastWorkspaceNew {...props} submitButtonText={submitButtonText} />
          )}
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
