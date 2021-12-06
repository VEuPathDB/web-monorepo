import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { StudyAccessApi } from '../study-access/api';

export interface WdkDependenciesWithStudyAccessApi extends WdkDependencies {
  studyAccessApi: StudyAccessApi;
}

export function areCompatibleWdkDependencies(
  wdkDependencies: WdkDependencies | undefined
): wdkDependencies is WdkDependenciesWithStudyAccessApi {
  return (
    wdkDependencies != null &&
    'studyAccessApi' in wdkDependencies
  );
}

export function wrapWdkDependencies(
  studyAccessApiUrl: string,
  wdkDependencies: WdkDependencies
): WdkDependenciesWithStudyAccessApi {
  const studyAccessApi = new StudyAccessApi(
    { baseUrl: studyAccessApiUrl },
    wdkDependencies.wdkService
  );

  return {
    ...wdkDependencies,
    studyAccessApi
  };
}
