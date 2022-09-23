import { useMemo } from 'react';

import { defaultMemoize } from 'reselect';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { StudyAccessApi } from '../study-access/api';
import { UserPermissions, checkPermissions } from '../study-access/permission';
import { useStudyAccessApi } from '../study-access/studyAccessHooks';

export type AsyncUserPermissions =
  | { loading: true }
  | { loading: false, permissions: UserPermissions };

const memoizedPermissionsCheck = defaultMemoize(function (
  user: User,
  studyAccessApi: StudyAccessApi
) {
  return checkPermissions(user, studyAccessApi);
});

export function usePermissions(): AsyncUserPermissions {
  const studyAccessApi = useStudyAccessApi();

  const permissions = useWdkService(
    async wdkService => memoizedPermissionsCheck(
      await wdkService.getCurrentUser({ force: true }),
      studyAccessApi
    ),
    [studyAccessApi]
  );

  return useMemo(
    () => permissions == null
      ? { loading: true }
      : { loading: false, permissions },
    [ permissions ]
  );
}
