import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from 'ortho-client/component-wrappers';
import pluginConfig from 'ortho-client/pluginConfig';
import { wrapRoutes } from 'ortho-client/routes';
import { wrapStoreModules } from 'ortho-client/wrapStoreModules';
import { wrapWdkService } from 'ortho-client/services';

import 'eupathdb/wdkCustomization/css/client.scss';
import 'site/wdkCustomization/css/client.scss';

initialize({
  componentWrappers,
  pluginConfig,
  wrapRoutes,
  wrapStoreModules,
  wrapWdkService
});
