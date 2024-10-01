import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from 'react/jsx-runtime';
import { Switch, Redirect } from 'react-router-dom';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import UserDatasetAllUploadsController from '../Controllers/UserDatasetAllUploadsController';
import UserDatasetListController from '../Controllers/UserDatasetListController';
import UserDatasetNewUploadController from '../Controllers/UserDatasetNewUploadController';
function UserDatasetsWorkspace(props) {
  const {
    baseUrl,
    helpRoute,
    uploadPageConfig,
    workspaceTitle,
    helpTabContents,
    dataNoun,
  } = props;
  return _jsxs('div', {
    children: [
      _jsx(WorkspaceNavigation, {
        heading: workspaceTitle,
        routeBase: baseUrl,
        items: [
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
        ].flat(),
      }),
      _jsxs(Switch, {
        children: [
          _jsx(WdkRoute, {
            exact: true,
            requiresLogin: true,
            path: baseUrl,
            component: () =>
              _jsx(UserDatasetListController, {
                baseUrl: baseUrl,
                hasDirectUpload: uploadPageConfig.hasDirectUpload,
                helpRoute: helpRoute,
                workspaceTitle: workspaceTitle,
                dataNoun: dataNoun,
              }),
            disclaimerProps: { toDoWhatMessage: 'To view your datasets' },
          }),
          uploadPageConfig.hasDirectUpload &&
            _jsx(WdkRoute, {
              requiresLogin: true,
              exact: true,
              path: `${baseUrl}/new`,
              component: () =>
                _jsx(UserDatasetNewUploadController, {
                  baseUrl: baseUrl,
                  // TODO When more than one type is available, offer a data type selector
                  datasetUploadType:
                    uploadPageConfig.uploadTypeConfig[
                      uploadPageConfig.availableUploadTypes[0]
                    ],
                  urlParams: props.urlParams,
                }),
              disclaimerProps: {
                toDoWhatMessage: `To upload your dataset`,
                extraParagraphContent:
                  Object.entries(props.urlParams).length === 0
                    ? undefined
                    : _jsxs('div', {
                        children: [
                          'Afterwards, you will be taken back to an upload page with these details:',
                          _jsx(
                            'ul',
                            Object.assign(
                              { style: { listStyle: 'none' } },
                              {
                                children: Object.entries(props.urlParams).map(
                                  (e) =>
                                    _jsxs(
                                      'li',
                                      {
                                        children: [
                                          e[0].charAt(0).toUpperCase() +
                                            e[0].slice(1).replace('_', ' ') +
                                            ': ',
                                          _jsx('code', { children: e[1] }),
                                        ],
                                      },
                                      e.join(' ')
                                    )
                                ),
                              }
                            )
                          ),
                        ],
                      }),
              },
            }),
          uploadPageConfig.hasDirectUpload &&
            _jsx(WdkRoute, {
              requiresLogin: true,
              exact: true,
              path: `${baseUrl}/recent`,
              component: () =>
                _jsx(UserDatasetAllUploadsController, { baseUrl: baseUrl }),
              disclaimerProps: {
                toDoWhatMessage: 'To view your recent uploads',
              },
            }),
          helpTabContents != null &&
            _jsx(WdkRoute, {
              requiresLogin: false,
              exact: true,
              path: `${baseUrl}/help`,
              component: () => _jsx(_Fragment, { children: helpTabContents }),
            }),
          _jsx(Redirect, { to: baseUrl }),
        ],
      }),
    ],
  });
}
export default UserDatasetsWorkspace;
//# sourceMappingURL=UserDatasetsWorkspace.js.map
