import * as React from 'react';
import PageController from '../Core/Controllers/PageController';
import { wrappable } from '../Utils/ComponentUtils';
import NotFound from '../Views/NotFound/NotFound';

/**
 * Rendered whenever a URL does not match a route
 */
class NotFoundController extends PageController {
  renderView() {
    return <NotFound />;
  }
}

export default wrappable(NotFoundController);
