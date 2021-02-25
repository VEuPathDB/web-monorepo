import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { number, record, string, type, TypeOf } from 'io-ts';
import { Filter } from '../types/filter';
import { ioTransformer } from './ioTransformer';

export interface HistogramRequestParams {
  filters: Filter[];
}

//////////////// TO CHANGE!!
export type HistogramResponse = TypeOf<typeof HistogramResponse>;

export const HistogramResponse = type({
  entitiesCount: number,
  distribution: record(string, number),
});

export class DataClient extends FetchClient {
  getNumericHistogramNumBins(
    studyId: string,
    entityId: string,
    variableId: string,
    params: HistogramRequestParams
  ): Promise<HistogramResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        // CHANGE ME vvvvvvvvvvvvvvvvvvvvvvvvvvvv
        path: `/studies/${studyId}/entities/${entityId}/variables/${variableId}/distribution`,
        body: params,
        transformResponse: ioTransformer(HistogramResponse),
      })
    );
  }
}
