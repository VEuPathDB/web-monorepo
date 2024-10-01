var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { useState } from 'react';
import { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
export function useProjectFilter() {
  const [projectFilter, setProjectFilter] = useState(undefined);
  useWdkEffect(
    (wdkService) =>
      Task.fromPromise(() =>
        __awaiter(this, void 0, void 0, function* () {
          try {
            const currentUserPreferences =
              yield wdkService.getCurrentUserPreferences();
            return (
              currentUserPreferences.global[FILTER_BY_PROJECT_PREF] !== 'false'
            );
          } catch (_a) {
            return false;
          }
        })
      ).run(setProjectFilter),
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
  return [projectFilter, setProjectFilter];
}
//# sourceMappingURL=project-filter.js.map
