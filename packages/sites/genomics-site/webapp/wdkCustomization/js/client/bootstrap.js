import { partial } from 'lodash';
import { initialize as initializeEbrc } from '@veupathdb/web-common/lib/bootstrap';
// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import { wrapRoutes } from './routes';
import wrapStoreModules from './wrapStoreModules';
import { wrapWdkService } from './wrapWdkService';
import pluginConfig from './pluginConfig';

import { reduxMiddleware } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';


// import CSS files
import '@veupathdb/web-common/lib/styles/client.scss';
import '@veupathdb/preferred-organisms/lib/components/OrganismNode.scss';
import 'site/css/AllApiSites.css';
import 'site/wdkCustomization/css/client.scss';
import { edaServiceUrl } from '@veupathdb/web-common/lib/config';

// Initialize the application.
export const initialize =  initializeWdk => initializeEbrc({
  initializeWdk,
  componentWrappers,
  wrapRoutes,
  wrapStoreModules,
  wrapWdkService,
  wrapWdkDependencies: partial(wrapWdkDependencies, edaServiceUrl),
  pluginConfig,
  additionalMiddleware: [ reduxMiddleware ],
})
