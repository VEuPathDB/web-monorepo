import { initialize } from '@veupathdb/web-common';

import '@veupathdb/web-common/lib/styles/client.scss';
import 'site/wdkCustomization/css/client.scss';

import componentWrappers from 'ortho-client/component-wrappers';
import pluginConfig from 'ortho-client/pluginConfig';
import { wrapRoutes } from 'ortho-client/routes';
import { wrapStoreModules } from 'ortho-client/wrapStoreModules';
import { wrapWdkService } from 'ortho-client/services';

initialize({
  componentWrappers,
  pluginConfig,
  wrapRoutes,
  wrapStoreModules,
  wrapWdkService,
});
