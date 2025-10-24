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
import { makeDatasetUploadPageConfig } from "./lib/Utils/upload-config";

import "@veupathdb/wdk-client/lib/Core/Style/index.scss";
import "@veupathdb/web-common/lib/styles/client.scss";
import { InputDatasetType } from "./lib/Service/Types/io-types";
import { useAllCompatibleUploadTypes } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { equalTypes } from "./lib/Utils/type-utils";
import { VariableDisplayText } from "./lib/Components/FormTypes";

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
        // Upload types configured in the service for the current project.
        const availableUploadTypes = useAllCompatibleUploadTypes();

        // Allow client config to override the service config.
        const enabledUploadTypes = process.env.REACT_APP_AVAILABLE_UPLOAD_TYPES
            ?.trim()
            ?.split(/\s*,\s*/g)
            // default all to version 1.0 since we don't currently have any other
            // versions.
            ?.map(name => ({ name, version: "1.0" } as InputDatasetType))
          ?? [];

        const displayText: VariableDisplayText = {
          detailsPageTitle: "My Data Set",
          workspaceTitle: "My Data Sets",
          datasetNameLabel: "Data set name",
          summaryPlaceholder: "Provide a concise summary of the data set (max 400 characters).",
          datasetNounSingular: "Data set",
          datasetNounPlural: "Data sets",
        };

        const uploadPageConfig = makeDatasetUploadPageConfig(
          availableUploadTypes.filter(ct => enabledUploadTypes.find(et => equalTypes(ct, et))),
          displayText,
        );

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

        return projectName == null
          ? <Loading/>
          : (
            <UserDatasetHelp
              hasDirectUpload={hasDirectUpload}
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
