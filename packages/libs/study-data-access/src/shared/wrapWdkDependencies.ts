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
  wdkDependencies: WdkDependencies,
  studyAccessApiUrl?: string
): WdkDependenciesWithStudyAccessApi {

  let studyAccessApi = new StudyAccessApi(
    { baseUrl: studyAccessApiUrl || ''},
    wdkDependencies.wdkService
  );

  // If no studyAccessApiUrl provided, ensure the fetchPermissions always returns 'approved'
  if (!studyAccessApiUrl) {

    const studyAccessHandler = {
      
      get: function(target: StudyAccessApi, propKey: string, receiver: StudyAccessApi){
        const propValue = target[propKey];
        if (propValue === "fetchPermissions") {
          return function(){
            console.log("intercepting fetchPermissions");
            return "approved" 
          }
        } else {
          return propValue;
        }
      }
    }

    studyAccessApi = new Proxy(studyAccessApi, studyAccessHandler)
  }

  return {
    ...wdkDependencies,
    studyAccessApi
  };
}
