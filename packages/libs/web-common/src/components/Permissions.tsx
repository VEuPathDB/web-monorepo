import React from 'react';

import { defaultMemoize } from 'reselect';

import { usePromise } from 'wdk-client/Hooks/PromiseHook';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { User } from 'wdk-client/Utils/WdkUser';

import { UserPermissions, checkPermissions } from 'ebrc-client/StudyAccess/permission';

const memoizedPermissionsCheck = defaultMemoize(function (user: User | undefined) {
  return user && checkPermissions(user);
});

export function withPermissions<P>(Component: React.ComponentType<P & { permissions: UserPermissions }>): React.ComponentType<P> {
  return function(props) {
    const user = useWdkService(
      wdkService => wdkService.getCurrentUser(),
      []
    );

    const { value: permissions } = usePromise(
      async () => memoizedPermissionsCheck(user),
      [ user ]
    );

    return permissions == null
      ? null
      : <Component {...props} permissions={permissions} />;
  }
}
