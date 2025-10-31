import "./globals";
import { vdiServiceUrl } from "./constants";

import { RouteComponentProps } from "react-router-dom";

import { partial } from "lodash";

import { initialize } from "@veupathdb/web-common/lib/bootstrap";
import { RouteEntry } from "@veupathdb/wdk-client/lib/Core/RouteEntry";
import Header from "./Header";
import Home from "./Home";
import { endpoint, rootElement, rootUrl } from "./constants";
import reportWebVitals from "./reportWebVitals";

import { Loading } from "@veupathdb/wdk-client/lib/Components";
import { useWdkService } from "@veupathdb/wdk-client/lib/Hooks/WdkServiceHook";

import UserDatasetHelp from "./lib/Components/UserDatasetHelp";
import { quotaSize } from "./lib/Components/UserDatasetUtils";
import { UserDatasetRouter } from "./lib/Controllers/UserDatasetRouter";
import { wrapWdkService } from "./lib/Service";
import { wrapStoreModules } from "./lib/StoreModules";

import "@veupathdb/wdk-client/lib/Core/Style/index.scss";
import "@veupathdb/web-common/lib/styles/client.scss";
import { useUploadPageConfig } from "./lib/Hooks/upload-page-config";


initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: "/",
      component: (props: RouteComponentProps<void>) => <Home/>,
    },
    {
      path: "/user-datasets",
      exact: false,
      component: function DatasetRouter() {

        const uploadPageConfig = useUploadPageConfig();

        return (
          <UserDatasetRouter
            formConfig={uploadPageConfig}
            helpRoute="/help"
          />
        );
      },
    },
    {
      path: "/help",
      exact: true,
      component: function DevHelp() {
        const projectName = useWdkService(
          async (wdkService) => (await wdkService.getConfig()).displayName,
          [],
        );

        const config = useUploadPageConfig()

        return projectName == null
          ? <Loading/>
          : (
            <UserDatasetHelp
              hasDirectUpload={config.hasDirectUpload}
              projectName={projectName}
              quotaSize={quotaSize}
              workspaceTitle="My Data Sets"
            />
          );
      },
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  endpoint,
  wrapStoreModules,
  wrapWdkService: partial(wrapWdkService, {
    vdiServiceUrl,
  }),
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
