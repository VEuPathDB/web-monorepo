import { array, number, type } from 'io-ts';
import { memoize } from 'lodash';
import { saveAs } from 'file-saver';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import { Filter } from '../../types/filter';
import { StudyMetadata, StudyOverview } from '../../types/study';

import {
  DistributionRequestParams,
  DistributionResponse,
  StudyResponse,
  TabularDataRequestParams,
  TabularDataResponse,
} from './types';

export default class SubsettingClient extends FetchClientWithCredentials {
  static getClient = memoize(
    (baseUrl: string, wdkService: WdkService): SubsettingClient =>
      new SubsettingClient({ baseUrl }, wdkService)
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

  /**
   * Method to download tabular data. Note that this using native `fetch` instead
   * of the customized fetch call in `DataClient` because there would need to
   * be some underlying changes that would need to be made to it.
   */
  tabularDataDownload(
    studyId: string,
    entityId: string,
    params: TabularDataRequestParams
  ): void {
    fetch(
      `/eda-subsetting-service/studies/${studyId}/entities/${entityId}/tabular`,
      {
        ...this.init,
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          accept: 'text/tab-separated-values',
          'content-type': 'application/json',
          ...this.init.headers,
        },
      }
    )
      .then((response) => response.blob())
      .then((blob) => saveAs(blob, 'dataset.tsv'));
  }
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
