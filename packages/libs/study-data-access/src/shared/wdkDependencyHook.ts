import { makeUseRefinedContext } from '@veupathdb/wdk-client/lib/Hooks/RefinedContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { areCompatibleWdkDependencies } from './wrapWdkDependencies';

const useRefinedWdkDependenciesContext = makeUseRefinedContext(
  areCompatibleWdkDependencies,
  (_) =>
    'In order to use data restrictions, ' +
    'a study access API must be included in the WDK dependencies.'
);

export function useWdkDependenciesWithStudyAccessApi() {
  return useRefinedWdkDependenciesContext(WdkDependenciesContext);
}
