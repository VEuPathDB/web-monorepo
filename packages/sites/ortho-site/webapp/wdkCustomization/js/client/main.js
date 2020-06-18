import { initialize } from 'ebrc-client/bootstrap';
import componentWrappers from './component-wrappers';
import { wrapRoutes } from './routes';

import 'eupathdb/wdkCustomization/css/client.scss';

initialize({
  componentWrappers,
  wrapRoutes
});
