import { Switch, Redirect } from 'react-router';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import UserDatasetAllUploadsController from '../Controllers/UserDatasetAllUploadsController';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import UserDatasetNewUploadController from '../Controllers/UserDatasetNewUploadController';

import { DatasetUploadPageConfig } from '../Utils/types';

import { quotaSize } from './UserDatasetUtils';
import UserDatasetHelp from './UserDatasetHelp';

interface Props {
  baseUrl: string;
  uploadPageConfig: DatasetUploadPageConfig;
  urlParams: Record<string, string>;
}

function UserDatasetsWorkspace(props: Props) {
  const config = useWdkService((wdkService) => wdkService.getConfig(), []);
  if (config == null) return null;
  const { baseUrl, uploadPageConfig } = props;

  return (
    <div>
      <WorkspaceNavigation
        heading={<>My Data Sets</>}
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
          [
            {
              display: 'Help',
              route: '/help',
            },
          ],
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
                datasetType={uploadPageConfig.availableUploadTypes[0]}
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
        <WdkRoute
          exact
          requiresLogin={false}
          path={`${baseUrl}/help`}
          component={() => (
            <UserDatasetHelp
              hasDirectUpload={uploadPageConfig.hasDirectUpload}
              projectName={config.displayName}
              quotaSize={quotaSize}
            />
          )}
        />
        <Redirect to={baseUrl} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
