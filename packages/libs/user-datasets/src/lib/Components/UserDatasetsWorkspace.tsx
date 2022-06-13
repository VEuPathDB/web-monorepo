import { ReactNode } from 'react';

import { Switch, Redirect } from 'react-router-dom';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetAllUploadsController from '../Controllers/UserDatasetAllUploadsController';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import UserDatasetNewUploadController from '../Controllers/UserDatasetNewUploadController';

import { DatasetUploadPageConfig } from '../Utils/types';

interface Props {
  baseUrl: string;
  helpRoute: string;
  uploadPageConfig: DatasetUploadPageConfig;
  urlParams: Record<string, string>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
}

function UserDatasetsWorkspace(props: Props) {
  const {
    baseUrl,
    helpRoute,
    uploadPageConfig,
    workspaceTitle,
    helpTabContents,
  } = props;

  return (
    <div>
      <WorkspaceNavigation
        heading={workspaceTitle}
        routeBase={baseUrl}
        items={[
          [
            {
              display: 'All',
              route: '',
            },
          ],
          uploadPageConfig.hasDirectUpload
            ? [
                {
                  display: 'New upload',
                  route: '/new',
                },
                {
                  display: 'Recent uploads',
                  route: '/recent',
                },
              ]
            : [],
          helpTabContents != null
            ? [
                {
                  display: 'Help',
                  route: '/help',
                },
              ]
            : [],
        ].flat()}
      />
      <Switch>
        <WdkRoute
          exact
          requiresLogin
          path={baseUrl}
          component={() => (
            <UserDatasetListController
              baseUrl={baseUrl}
              hasDirectUpload={uploadPageConfig.hasDirectUpload}
              helpRoute={helpRoute}
              workspaceTitle={workspaceTitle}
            />
          )}
          disclaimerProps={{ toDoWhatMessage: 'To view your datasets' }}
        />
        {uploadPageConfig.hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${baseUrl}/new`}
            component={() => (
              <UserDatasetNewUploadController
                baseUrl={baseUrl}
                // TODO When more than one type is available, offer a data type selector
                datasetUploadType={
                  uploadPageConfig.uploadTypeConfig[
                    uploadPageConfig.availableUploadTypes[0]
                  ]
                }
                urlParams={props.urlParams}
              />
            )}
            disclaimerProps={{
              toDoWhatMessage: `To upload your dataset`,
              extraParagraphContent:
                Object.entries(props.urlParams).length === 0 ? undefined : (
                  <div>
                    Afterwards, you will be taken back to an upload page with
                    these details:
                    <ul style={{ listStyle: 'none' }}>
                      {Object.entries(props.urlParams).map((e) => (
                        <li key={e.join(' ')}>
                          {e[0].charAt(0).toUpperCase() +
                            e[0].slice(1).replace('_', ' ') +
                            ': '}
                          <code>{e[1]}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            }}
          />
        )}
        {uploadPageConfig.hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${baseUrl}/recent`}
            component={() => (
              <UserDatasetAllUploadsController baseUrl={baseUrl} />
            )}
            disclaimerProps={{ toDoWhatMessage: 'To view your recent uploads' }}
          />
        )}
        {helpTabContents != null && (
          <WdkRoute
            requiresLogin
            exact
            path={`${baseUrl}/help`}
            component={() => <>{helpTabContents}</>}
          />
        )}
        <Redirect to={baseUrl} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
