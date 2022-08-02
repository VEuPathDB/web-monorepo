import { partial } from 'lodash';

import { initialize } from '@veupathdb/web-common';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import wrapWdkService from './wrapWdkService';
import { wrapRoutes } from './routes';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';
import 'site/css/MicrobiomeSite.css';
import { useEda } from '@veupathdb/web-common/lib/config';

// Initialize the application.
initialize({
  componentWrappers,
  wrapWdkDependencies: partial(
    wrapWdkDependencies,
    useEda
      ? edaServiceUrl 
      : undefined
  ),
  wrapStoreModules,
  wrapWdkService,
  wrapRoutes,
})
