import { useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { StudyAccessApi } from '../study-access/api';
import { UserPermissions, checkPermissions } from '../study-access/permission';
import { useStudyAccessApi } from '../study-access/studyAccessHooks';

export type AsyncUserPermissions =
  | { loading: true }
  | { loading: false; permissions: UserPermissions };

// Caches permissions until the location changes
export const cachedPermissionCheck = (function () {
  let result: Promise<UserPermissions>;
  let lastLocation = window.location.href;
  return function cachedPermissionCheck(
    user: User,
    studyAccessApi: StudyAccessApi
  ): Promise<UserPermissions> {
    if (result == null || lastLocation !== window.location.href) {
      lastLocation = window.location.href;
      result = checkPermissions(user, studyAccessApi);
    }
    return result;
  };
})();

export function usePermissions(): AsyncUserPermissions {
  const studyAccessApi = useStudyAccessApi();

  const permissions = useWdkService(
    async (wdkService) =>
      cachedPermissionCheck(await wdkService.getCurrentUser(), studyAccessApi),
    [studyAccessApi]
  );

  return useMemo(
    () =>
      permissions == null ? { loading: true } : { loading: false, permissions },
    [permissions]
  );
}
