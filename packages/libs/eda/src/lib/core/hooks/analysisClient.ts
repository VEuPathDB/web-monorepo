import { useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { AnalysisClient } from '../api/analysis-api';

export function useConfiguredAnalysisClient(
  userServiceUrl: string
): AnalysisClient | undefined {
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  const authKey = useMemo(() => {
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

    return wdkCheckAuth.replace(/^wdk_check_auth=/, '');
  }, [user]);

  return user == null || authKey == null
    ? undefined
    : AnalysisClient.getClient({ userServiceUrl, userId: user.id, authKey });
}
