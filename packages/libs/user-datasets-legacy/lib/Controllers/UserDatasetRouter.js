import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import WdkRoute from '@veupathdb/wdk-client/lib/Core/WdkRoute';
import UserDatasetsWorkspace from '../Components/UserDatasetsWorkspace';
import { makeDatasetUploadPageConfig } from '../Utils/upload-config';
import UserDatasetDetailController from './UserDatasetDetailController';
export function UserDatasetRouter({
  availableUploadTypes,
  detailsPageTitle,
  helpRoute,
  uploadTypeConfig,
  workspaceTitle,
  helpTabContents,
  detailComponentsByTypeName,
  dataNoun,
}) {
  const { path, url } = useRouteMatch();
  const uploadPageConfig = useMemo(
    () => makeDatasetUploadPageConfig(availableUploadTypes, uploadTypeConfig),
    [availableUploadTypes, uploadTypeConfig]
  );
  return _jsxs(Switch, {
    children: [
      _jsx(WdkRoute, {
        path: `${path}/:id(\\d+)`,
        requiresLogin: true,
        component: (props) => {
          return _jsx(
            UserDatasetDetailController,
            Object.assign(
              {
                baseUrl: url,
                detailsPageTitle: detailsPageTitle,
                workspaceTitle: workspaceTitle,
                detailComponentsByTypeName: detailComponentsByTypeName,
                dataNoun: dataNoun,
              },
              props.match.params
            )
          );
        },
      }),
      _jsx(WdkRoute, {
        path: path,
        exact: false,
        requiresLogin: false,
        component: function UserDatasetsWorkspaceRoute(props) {
          const urlParams = useMemo(() => {
            const searchParamEntries = new URLSearchParams(
              props.location.search
            ).entries();
            return Object.fromEntries(searchParamEntries);
          }, [props.location.search]);
          return _jsx(UserDatasetsWorkspace, {
            baseUrl: url,
            helpRoute: helpRoute,
            uploadPageConfig: uploadPageConfig,
            urlParams: urlParams,
            workspaceTitle: workspaceTitle,
            helpTabContents: helpTabContents,
            dataNoun: dataNoun,
          });
        },
      }),
    ],
  });
}
//# sourceMappingURL=UserDatasetRouter.js.map
