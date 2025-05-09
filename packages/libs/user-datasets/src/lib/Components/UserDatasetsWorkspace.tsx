import { ReactNode } from 'react';

import { Switch, Redirect, RouteComponentProps } from 'react-router-dom';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';

import UserDatasetListController from '../Controllers/UserDatasetListController';
import UserDatasetNewUploadController from '../Controllers/UserDatasetNewUploadController';

import { DatasetUploadPageConfig, DataNoun } from '../Utils/types';

interface Props {
  baseUrl: string;
  helpRoute: string;
  uploadPageConfig: DatasetUploadPageConfig;
  urlParams: Record<string, string>;
  workspaceTitle: string;
  helpTabContents?: ReactNode;
  dataNoun: DataNoun;
  enablePublicUserDatasets: boolean;
  showExtraMetadata?: boolean; // Used in the upload form
}

function UserDatasetsWorkspace(props: Props) {
  const {
    baseUrl,
    helpRoute,
    uploadPageConfig,
    workspaceTitle,
    helpTabContents,
    dataNoun,
    enablePublicUserDatasets,
    showExtraMetadata = false,
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
                  exact: false,
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
              dataNoun={dataNoun}
              enablePublicUserDatasets={enablePublicUserDatasets}
            />
          )}
          disclaimerProps={{ toDoWhatMessage: 'To view your datasets' }}
        />
        {uploadPageConfig.hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${baseUrl}/new/:type?`}
            component={(childProps: RouteComponentProps<{ type?: string }>) => (
              <UserDatasetNewUploadController
                baseUrl={baseUrl}
                type={childProps.match.params.type}
                availableTypes={uploadPageConfig.availableUploadTypes}
                datasetUploadTypes={uploadPageConfig.uploadTypeConfig}
                urlParams={props.urlParams}
                showExtraMetadata={showExtraMetadata}
              />
            )}
            disclaimerProps={{
              toDoWhatMessage: `To upload your dataset`,
              extraParagraphContent:
                Object.entries(props.urlParams).length === 0 ? undefined : (
                  <div style={{ width: '100%', paddingBottom: 20 }}>
                    <div style={{ paddingBottom: 5, textAlign: 'center' }}>
                      Afterwards, you will be taken back to an upload page with
                      these details:
                    </div>

                    <ul style={{ listStyle: 'none' }}>
                      {Object.entries(props.urlParams).map((e) => (
                        <li
                          key={e.join(' ')}
                          style={{
                            paddingBottom: 5,
                            maxWidth: '100%',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>
                            {e[0].charAt(0).toUpperCase() +
                              e[0].slice(1).replace('_', ' ') +
                              ': '}
                          </span>
                          <code style={{ verticalAlign: 'bottom' }}>
                            {e[1].trim()}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            }}
          />
        )}
        {/* {uploadPageConfig.hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${baseUrl}/recent`}
            component={() => (
              <UserDatasetAllUploadsController baseUrl={baseUrl} />
            )}
            disclaimerProps={{ toDoWhatMessage: 'To view your recent uploads' }}
          />
        )} */}
        {helpTabContents != null && (
          <WdkRoute
            requiresLogin={false}
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
