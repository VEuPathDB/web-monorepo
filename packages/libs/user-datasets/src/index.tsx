import './globals';
import { vdiServiceUrl } from './constants';

import { RouteComponentProps } from 'react-router-dom';

import { isEmpty, partial } from 'lodash';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import UserDatasetHelp from './lib/Components/UserDatasetHelp';
import { UserDatasetRouter } from './lib/Controllers/UserDatasetRouter';
import { useVdiService, wrapWdkService } from './lib/Service';
import { wrapStoreModules } from './lib/StoreModules';

import {
  userDatasetTypeConfigs,
  uploadFormConfigurators,
} from '@veupathdb/web-common/src/user-dataset-upload-config';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';
import { useState } from 'react';
import { VdiApiConfig } from './lib/Service/Model/response-decoders';
import { projectId } from '@veupathdb/web-common/lib/config';

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: (_: RouteComponentProps<void>) => <Home />,
    },
    {
      path: '/user-datasets',
      exact: false,
      component: () => (
        <UserDatasetRouter
          datasetTypeConfigs={userDatasetTypeConfigs}
          uploadFormConfigurators={uploadFormConfigurators}
          detailsPageTitle="My Dataset"
          helpRoute="/help"
          workspaceTitle="My Datasets"
          dataNoun={{
            singular: 'Dataset',
            plural: 'Datasets',
          }}
        />
      ),
    },
    {
      path: '/help',
      exact: true,
      component: function DevHelp() {
        const projectName = useWdkService(
          async (wdkService) => (await wdkService.getConfig()).displayName,
          []
        );

        const [vdiConf, setVdiConf] = useState<VdiApiConfig>();
        const [allowsUploads, setAllowsUploads] = useState<boolean>();

        useVdiService(async (vdi) => {
          vdi
            .getServiceMetadata()
            .then((it) => it.configuration.api)
            .then(setVdiConf);
          vdi
            .getPluginList(projectId)
            .then((it) => it.some((conf) => !isEmpty(conf.dataTypes)))
            .then(setAllowsUploads);
        });

        return !projectName || !vdiConf || allowsUploads === undefined ? (
          <Loading />
        ) : (
          <UserDatasetHelp
            hasDirectUpload={allowsUploads}
            projectName={projectName}
            quotaSize={vdiConf.userMaxStorageSize}
            workspaceTitle="My Datasets"
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
