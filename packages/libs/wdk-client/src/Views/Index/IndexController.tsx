import * as React from 'react';
import Link from '../../Components/Link/Link';
import { wrappable } from '../../Utils/ComponentUtils';
import WdkPageController from '../../Core/Controllers/WdkPageController';

// Link is a component used to create links to other routes.
// See https://github.com/rackt/react-router/blob/master/docs/api/components/Link.md

/**
 * This component is rendered by the DefaultRoute in ../routes.js.
 *
 * It's current purpose is to demonstrate how one can create links to other
 * routes. In this case we use Link, which is provided by the react-router
 * library. The `to` property is the *path* of a route, as defined in
 * ../routes.js. Additional parameters and query arguments can be provided to
 * the Link component as props (params and query, resp). The reason to use Link
 * as opposed to the more common <a> is that Link will generate the correct
 * href attribute based on the router Location implementation specified in the
 * bootstrapping process.
 *
 * See https://github.com/rackt/react-router/blob/master/docs/api/run.md#location-optional
 * and https://github.com/rackt/react-router/blob/master/docs/api/misc/Location.md
 * for more details.
 */
class IndexController extends WdkPageController {
  renderView() {
    return (
      <div>
        <p>This is the future home of WDK 3.0</p>
        <h2>Resources under development</h2>
        <ul>
          <li><Link to="/question-list">Question list</Link></li>
          <li><Link to="/user/profile">User Profile</Link></li>
          <li><Link to="/data-finder">Data Finder</Link></li>
        </ul>
      </div>
    );
  }
}

export default wrappable(IndexController);
