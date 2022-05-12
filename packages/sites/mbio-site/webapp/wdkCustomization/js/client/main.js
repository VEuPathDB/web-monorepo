import { partial } from 'lodash';

import { initialize } from '@veupathdb/web-common';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './componentWrappers';
import wrapStoreModules from './wrapStoreModules';
import wrapWdkService from './wrapWdkService';
import { wrapRoutes } from './routes';

import 'site/css/MicrobiomeSite.css';

// Initialize the application.
initialize({
  componentWrappers,
  wrapStoreModules,
  wrapWdkService,
  wrapWdkDependencies: partial(wrapWdkDependencies, undefined),
  wrapRoutes,
})
