import * as React from 'react';
import WdkPageController from '../../Core/Controllers/WdkPageController';
import { wrappable } from '../../Utils/ComponentUtils';
import NotFound from '../../Views/NotFound/NotFound';

/**
 * Rendered whenever a URL does not match a route
 */
class NotFoundController extends WdkPageController {
  renderView() {
    return (
      <NotFound/>
    );
  }
}

export default wrappable(NotFoundController);
