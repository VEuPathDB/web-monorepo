import { partial } from 'lodash';

import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';

import '@veupathdb/web-common/lib/styles/client.scss';

import componentWrappers from './component-wrappers';
import wrapStoreModules from './wrapStoreModules';
import wrapWdkService from './wrapWdkService';
import { wrapRoutes } from './routes';

import 'site/css/ClinEpiSite.scss';

initialize({
  componentWrappers,
  wrapWdkDependencies: partial(wrapWdkDependencies, edaServiceUrl),
  wrapWdkService,
  wrapStoreModules,
  wrapRoutes,
});
