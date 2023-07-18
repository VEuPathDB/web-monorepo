import { WdkDependencies } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { StudyAccessApi, StubbedStudyAccessApi } from '../study-access/api';

export interface WdkDependenciesWithStudyAccessApi extends WdkDependencies {
  studyAccessApi: StudyAccessApi;
}

export function areCompatibleWdkDependencies(
  wdkDependencies: WdkDependencies | undefined
): wdkDependencies is WdkDependenciesWithStudyAccessApi {
  return wdkDependencies != null && 'studyAccessApi' in wdkDependencies;
}

export function wrapWdkDependencies(
  studyAccessApiUrl: string | undefined,
  wdkDependencies: WdkDependencies
): WdkDependenciesWithStudyAccessApi {
  let studyAccessApi;

  if (studyAccessApiUrl) {
    studyAccessApi = new StudyAccessApi(
      { baseUrl: studyAccessApiUrl },
      wdkDependencies.wdkService
    );
  } else {
    // The stubbed version's fetchPermissions returns a perDataset obj that allows all actions.
    studyAccessApi = new StubbedStudyAccessApi(
      { baseUrl: '' },
      wdkDependencies.wdkService
    );
  }

  return {
    ...wdkDependencies,
    studyAccessApi,
  };
}
