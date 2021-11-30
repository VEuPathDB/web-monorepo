import { useMemo } from 'react';

import { defaultMemoize } from 'reselect';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { UserPermissions, checkPermissions } from '../study-access/permission';

export type AsyncUserPermissions =
  | { loading: true }
  | { loading: false, permissions: UserPermissions };

const memoizedPermissionsCheck = defaultMemoize(function (
  user: User,
  wdkService: WdkService
) {
  return checkPermissions(user, wdkService);
});

export function usePermissions(): AsyncUserPermissions {
  const permissions = useWdkService(
    async wdkService => memoizedPermissionsCheck(
      await wdkService.getCurrentUser(),
      wdkService
    ),
    []
  );

  return useMemo(
    () => permissions == null
      ? { loading: true }
      : { loading: false, permissions },
    [ permissions ]
  );
}
