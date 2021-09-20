import { useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

export function useAuthKey() {
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  return useMemo(() => {
    if (user == null) {
      return undefined;
    }

    if (user.isGuest) {
      return String(user.id);
    }

    const wdkCheckAuth = document.cookie
      .split('; ')
      .find((x) => x.startsWith('wdk_check_auth='));

    if (wdkCheckAuth == null) {
      throw new Error(
        `Tried to retrieve a non-existent WDK auth key for user ${user.id}`
      );
    }

    return wdkCheckAuth;
  }, [user]);
}
