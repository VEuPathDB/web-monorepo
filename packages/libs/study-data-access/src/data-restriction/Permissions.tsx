import React from 'react';

import { UserPermissions } from '../study-access/permission';
import { usePermissions } from '../data-restriction/permissionsHooks';

/**
 * This higher-order component fetches the user's UserPermissions and
 * passes them to the "Component".
 *
 * Note: rendering of the "Component" is deferred until the fetch is
 * complete. Prefer to invoke "usePermissions" within the
 * "Component" whenever the "Component" should be rendered concurrently
 * with the fetching of the UserPermissions.
 */
 export function withPermissions<P>(Component: React.ComponentType<P & { permissions: UserPermissions }>): React.ComponentType<P> {
  return function(props) {
    const permissionsValue = usePermissions();

    return permissionsValue.loading
      ? null
      : <Component {...props} permissions={permissionsValue.permissions} />;
  }
}
