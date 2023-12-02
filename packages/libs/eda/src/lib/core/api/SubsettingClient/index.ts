import { array, number, type } from 'io-ts';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import { Filter } from '../../types/filter';
import { StudyEntity, StudyMetadata, StudyOverview } from '../../types/study';

import {
  DistributionRequestParams,
  DistributionResponse,
  StudyResponse,
  TabularDataRequestParams,
  TabularDataResponse,
} from './types';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';

export default class SubsettingClient extends FetchClientWithCredentials {
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
        transformResponse: async (res) => {
          const { study } = await ioTransformer(StudyResponse)(res);
          assertValidStudy(study);
          orderVariables(study);
          return study;
        },
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
  async tabularDataDownload(
    studyId: string,
    entityId: string,
    params: TabularDataRequestParams
  ): Promise<void> {
    submitAsForm({
      action: `${
        this.baseUrl
      }/studies/${studyId}/entities/${entityId}/tabular?Auth-Key=${encodeURIComponent(
        await this.findUserRequestAuthKey()
      )}`,
      inputs: {
        data: JSON.stringify(params),
      },
    });
  }
}

// !!MUTATION!! order variables in-place
function orderVariables(study: StudyMetadata) {
  for (const entity of preorder(
    study.rootEntity,
    (entity) => entity.children ?? []
  ))
    entity.variables.sort((var1, var2) => {
      if (var1.displayOrder != null && var2.displayOrder != null)
        return var1.displayOrder - var2.displayOrder;
      if (var1.displayOrder != null) return -1;
      if (var2.displayOrder != null) return 1;
      return var1.displayName < var2.displayName
        ? -1
        : var1.displayName > var2.displayName
        ? 1
        : 0;
    });
  return study;
}

function assertValidStudy(study: StudyMetadata) {
  const entitiesWithoutVariables: StudyEntity[] = [];
  for (const entity of preorder(
    study.rootEntity,
    (entity) => entity.children ?? []
  )) {
    if (entity.variables.length === 0) entitiesWithoutVariables.push(entity);
  }
  if (entitiesWithoutVariables.length > 0) {
    const entityDescriptors = entitiesWithoutVariables.map(
      (entity) => `${entity.displayName} (${entity.id})`
    );
    throw new Error(
      `Found entities without variables: ${entityDescriptors.join(', ')}.`
    );
  }
}

export * from './types';
