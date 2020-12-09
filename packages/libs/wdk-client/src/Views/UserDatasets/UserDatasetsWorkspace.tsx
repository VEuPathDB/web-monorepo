import React from "react";
import WorkspaceNavigation from "wdk-client/Components/Workspace/WorkspaceNavigation";
import { Route, Switch, Redirect } from "react-router";
import WdkRoute from 'wdk-client/Core/WdkRoute';
import UserDatasetListController from "wdk-client/Controllers/UserDatasetListController";
import UserDatasetNewUploadController from "wdk-client/Controllers/UserDatasetNewUploadController";
import { UserDatasetAllUploadsController } from "wdk-client/Controllers";
import { quotaSize } from 'wdk-client/Views/UserDatasets/UserDatasetUtils';
import UserDatasetHelp from 'wdk-client/Views/UserDatasets/UserDatasetHelp';
import { useWdkService } from "wdk-client/Hooks/WdkServiceHook";

interface Props {
  rootPath: string;
  urlParams: Record<string, string>
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
        <WdkRoute exact requiresLogin path={rootPath} component={() =>
          <UserDatasetListController/>
          }/>
        { hasDirectUpload && <WdkRoute requiresLogin exact path={`${rootPath}/new`} component={()=> 
						<UserDatasetNewUploadController urlParams={props.urlParams}/>
          }/> }
       
  { hasDirectUpload && 		<WdkRoute requiresLogin exact path={`${rootPath}/recent`} component={()=>
						<UserDatasetAllUploadsController/>
          }/> }
          <WdkRoute exact requiresLogin={false} path={`${rootPath}/help`} component={()=>
          <UserDatasetHelp projectId={config.projectId} quotaSize={quotaSize}/>
          }/>
        <Redirect to={rootPath}/>
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
