import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { array, number, type } from 'io-ts';
import { memoize } from 'lodash';
import { Filter } from '../../types/filter';
import { StudyMetadata, StudyOverview } from '../../types/study';
import { ioTransformer } from '../ioTransformer';
import {
  DistributionRequestParams,
  DistributionResponse,
  StudyResponse,
  TabularDataRequestParams,
  TabularDataResponse,
} from './types';

export default class SubsettingClient extends FetchClient {
  static getClient = memoize(
    (baseUrl: string): SubsettingClient => new SubsettingClient({ baseUrl })
  );

  getStudies(): Promise<StudyOverview[]> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: '/studies',
        transformResponse: (res) =>
          ioTransformer(type({ studies: array(StudyOverview) }))(res).then(
            (r) => r.studies
          ),
      })
    );
  }

  getStudyMetadata(studyId: string): Promise<StudyMetadata> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: `/studies/${studyId}`,
        transformResponse: (res) =>
          ioTransformer(StudyResponse)(res).then((r) =>
            orderVariables(r.study)
          ),
      })
    );
  }
  getEntityCount(
    studyId: string,
    entityId: string,
    filters: Filter[]
  ): Promise<{ count: number }> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/studies/${studyId}/entities/${entityId}/count`,
        body: { filters },
        transformResponse: ioTransformer(type({ count: number })),
      })
    );
  }
  getDistribution(
    studyId: string,
    entityId: string,
    variableId: string,
    params: DistributionRequestParams
  ): Promise<DistributionResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/studies/${studyId}/entities/${entityId}/variables/${variableId}/distribution`,
        body: params,
        transformResponse: ioTransformer(DistributionResponse),
      })
    );
  }

  /**
   * 
   * @param studyId fetch("https://localhost:3000/eda-subsetting-service/studies/PRISM0002-1/entities/EUPATH_0000096/tabular", {
  "headers": {
    "accept": "application/json",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1"
  },
  "referrer": "https://localhost:3000/eda/DS_51b40fe2e2/2/variables/EUPATH_0000096/EUPATH_0000151",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"filters\":[],\"outputVariableIds\":[\"EUPATH_0000151\"]}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
   */

  getTabularData(
    studyId: string,
    entityId: string,
    params: TabularDataRequestParams
  ): Promise<TabularDataResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/studies/${studyId}/entities/${entityId}/tabular`,
        body: params,
        headers: {
          accept: 'application/json',
        },
        transformResponse: ioTransformer(TabularDataResponse),
      })
    );
  }

  // getTabularDataDownload(
  //   studyId: string,
  //   entityId: string,
  //   params: TabularDataRequestParams
  // ) {
  //   return this.fetch(
  //     createJsonRequest({
  //       method: 'POST',
  //       path: `/studies/${studyId}/entities/${entityId}/tabular`,
  //       body: params,
  //       headers: {'text/tab-separated-values'}
  //       },
  //       transformResponse: ioTransformer(TabularDataResponse),
  //     })
  //   );
  // }
}

// !!MUTATION!! order variables in-place
function orderVariables(study: StudyMetadata) {
  for (const entity of preorder(
    study.rootEntity,
    (entity) => entity.children ?? []
  ))
    entity.variables.sort((var1, var2) => {
      if (var1.displayOrder && var2.displayOrder)
        return var1.displayOrder - var2.displayOrder;
      if (var1.displayOrder) return -1;
      if (var2.displayOrder) return 1;
      return var1.displayName < var2.displayName
        ? -1
        : var1.displayName > var2.displayName
        ? 1
        : 0;
    });
  return study;
}

export * from './types';
