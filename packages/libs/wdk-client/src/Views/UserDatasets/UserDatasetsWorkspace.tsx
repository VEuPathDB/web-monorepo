import React from "react";
import WorkspaceNavigation from "wdk-client/Components/Workspace/WorkspaceNavigation";
import { Route, Switch, Redirect } from "react-router";
import UserDatasetListController from "wdk-client/Controllers/UserDatasetListController";
import UserDatasetNewUploadController from "wdk-client/Controllers/UserDatasetNewUploadController";
import { UserDatasetAllUploadsController } from "wdk-client/Controllers";
import { quotaSize } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import UserDatasetHelp from 'wdk-client/Views/UserDatasets/UserDatasetHelp';
import { useWdkService } from "wdk-client/Hooks/WdkServiceHook";

interface Props {
  rootPath: string;
};

function UserDatasetsWorkspace(props: Props) {
  const config = useWdkService(wdkService => wdkService.getConfig(), []);
  if (config == null) return null;
  const { rootPath } = props;
  const hasDirectUpload = config.projectId === 'MicrobiomeDB';
  return (
    <div>
      <WorkspaceNavigation
        heading={
          <>
            My Data Sets
          </>
        }
        routeBase={rootPath}
        items={[
          [{
            display: 'All',
            route: ''
          }],
          (hasDirectUpload
					? [{
							display: 'New upload',
							route: '/new',
						},
						{
							display: 'Recent uploads',
							route: '/recent'
						}]
					: []),
          [{
            display: 'Help',
            route: '/help'
          }]
        ].flat()}
      />
      <Switch>
        <Route exact path={rootPath}>
          <UserDatasetListController/>
        </Route>
       { hasDirectUpload && <Route exact path={`${rootPath}/new`}>
						<UserDatasetNewUploadController/>
        </Route> }
       
    { hasDirectUpload && 		<Route exact path={`${rootPath}/recent`}>
						<UserDatasetAllUploadsController/>
					</Route> }
        <Route exact path={`${rootPath}/help`}>
          <UserDatasetHelp projectId={config.projectId} quotaSize={quotaSize}/>
        </Route>
        <Redirect to={rootPath}/>
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
