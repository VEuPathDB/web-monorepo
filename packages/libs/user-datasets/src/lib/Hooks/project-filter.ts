import { useState } from 'react';

import { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';

export function useProjectFilter() {
  const [projectFilter, setProjectFilter] = useState<boolean | undefined>(
    undefined
  );

  useWdkEffect(
    (wdkService) =>
      Task.fromPromise(async () => {
        try {
          const currentUserPreferences = await wdkService.getCurrentUserPreferences();

          return (
            currentUserPreferences.global[FILTER_BY_PROJECT_PREF] !== 'false'
          );
        } catch {
          return false;
        }
      }).run(setProjectFilter),
    []
  );

  useWdkEffect(
    (wdkService) => {
      if (projectFilter != null) {
        wdkService.patchSingleUserPreference(
          'global',
          FILTER_BY_PROJECT_PREF,
          String(projectFilter)
        );
      }
    },
    [projectFilter]
  );

  return [projectFilter, setProjectFilter] as const;
}
