import { Switch, Redirect } from 'react-router';

import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import UserDatasetAllUploadsController from '../Controllers/UserDatasetAllUploadsController';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import UserDatasetNewUploadController from '../Controllers/UserDatasetNewUploadController';

import { quotaSize } from './UserDatasetUtils';
import UserDatasetHelp from './UserDatasetHelp';

interface Props {
  rootPath: string;
  urlParams: Record<string, string>;
}

function UserDatasetsWorkspace(props: Props) {
  const config = useWdkService((wdkService) => wdkService.getConfig(), []);
  if (config == null) return null;
  const { rootPath } = props;
  const hasDirectUpload = config.projectId === 'MicrobiomeDB';
  return (
    <div>
      <WorkspaceNavigation
        heading={<>My Data Sets</>}
        routeBase={rootPath}
        items={[
          [
            {
              display: 'All',
              route: '',
            },
          ],
          hasDirectUpload
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
          path={rootPath}
          component={() => <UserDatasetListController />}
          disclaimerProps={{ toDoWhatMessage: 'To view your datasets' }}
        />
        {hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${rootPath}/new`}
            component={() => (
              <UserDatasetNewUploadController urlParams={props.urlParams} />
            )}
            disclaimerProps={{
              toDoWhatMessage: `To upload your dataset`,
              extraParagraphContent:
                Object.entries(props.urlParams).length == 0 ? undefined : (
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
        {hasDirectUpload && (
          <WdkRoute
            requiresLogin
            exact
            path={`${rootPath}/recent`}
            component={() => <UserDatasetAllUploadsController />}
            disclaimerProps={{ toDoWhatMessage: 'To view your recent uploads' }}
          />
        )}
        <WdkRoute
          exact
          requiresLogin={false}
          path={`${rootPath}/help`}
          component={() => (
            <UserDatasetHelp
              projectId={config.projectId}
              quotaSize={quotaSize}
            />
          )}
        />
        <Redirect to={rootPath} />
      </Switch>
    </div>
  );
}

export default UserDatasetsWorkspace;
