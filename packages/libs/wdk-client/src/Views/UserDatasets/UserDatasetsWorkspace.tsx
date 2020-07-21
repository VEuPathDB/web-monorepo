import React from "react";
import WorkspaceNavigation from "wdk-client/Components/Workspace/WorkspaceNavigation";
import { Route, Switch, Redirect } from "react-router";
import UserDatasetListController from "wdk-client/Controllers/UserDatasetListController";
import UserDatasetNewUploadController from "wdk-client/Controllers/UserDatasetNewUploadController";
import { UserDatasetAllUploadsController } from "wdk-client/Controllers";
import { useWdkService } from "wdk-client/Hooks/WdkServiceHook";
import HelpIcon from "wdk-client/Components/Icon/HelpIcon";

interface Props {
  rootPath: string;
};

function UserDatasetsWorkspace(props: Props) {
  const config = useWdkService(wdkService => wdkService.getConfig());
  const { rootPath } = props;
  if (config == null) return null;
  if (config.projectId !== 'MicrobiomeDB') return (
    <div>
      <h1>
        My Data Sets
        <HelpIcon>
          <div>
            Bring your own data sets to <b>{config.displayName}</b>.
            <ul style={{ marginTop: '10px' }}>
              <li>My Data Sets is currently enabled for data sets containing one or more bigwig files. </li>
              <li>Export this type of data set from your history in <a href='http://veupathdb.globusgenomics.org'>VEuPathDB Galaxy</a> <b>{config.displayName}</b>.</li>
              <li>Push compatible data straight to <a>GBrowse</a>, with other tooling coming soon.</li>
              <li>Share your data set with others and receive shared data from your colleagues.</li>
            </ul>
          </div>
        </HelpIcon>
      </h1>
      <UserDatasetListController/>
    </div>
  );
  return (
    <div>
      <WorkspaceNavigation
        heading={
          <>
            My Data Sets
            <HelpIcon>
              <div>
                Bring your own data sets to <b>MicrobiomeDB</b>.
                <ul style={{ marginTop: '10px' }}>
                  <li>Use our upload functionality to view your own data using MicrobiomeDB tools. </li>
                  <li>Visualise most abundant taxa, compare diversity between groups of samples, and more.</li>
                  <li>If you choose to, you can share your data set with others and receive shared data from your colleagues.</li>
                </ul>
              </div>
            </HelpIcon>
          </>
        }
        routeBase={rootPath}
        items={[
          {
            display: 'All',
            route: ''
          },
          {
            display: 'New upload',
            route: '/new',
          },
          {
            display: 'Recent uploads',
            route: '/recent'
          }
        ]}
      />
      <Switch>
        <Route exact path={rootPath}>
          <UserDatasetListController/>
        </Route>
        <Route exact path={`${rootPath}/new`}>
          <UserDatasetNewUploadController/>
        </Route>
        <Route exact path={`${rootPath}/recent`}>
          <UserDatasetAllUploadsController/>
        </Route>
        <Redirect to={rootPath}/>
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
