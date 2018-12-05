import * as React from 'react';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import NotFound from 'wdk-client/Views/NotFound/NotFound';

/**
 * Rendered whenever a URL does not match a route
 */
class NotFoundController extends PageController {
  renderView() {
    return (
      <NotFound/>
    );
  }
}

export default wrappable(NotFoundController);
