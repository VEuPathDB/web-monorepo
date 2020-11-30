import { ApiRequest, createJsonRequest, standardTransformer } from 'ebrc-client/util/api';
import { arrayOf, number, record, Unpack } from 'wdk-client/Utils/Json';
import { Filter } from '../types/filter';
import { StudyMetadata } from "../types/study";

export type StudyResponse = Unpack<typeof StudyResponse>;

export const StudyResponse = record({
  study: StudyMetadata
});


export interface HistogramRequestParams {
  outputEntityId: string;
  histogramVariableId: string;
  filters: Filter[];
}

export type HistogramResponse = Unpack<typeof HistogramResponse>;

export const HistogramResponse = record({
  counts: arrayOf(number)
});


// The following functions return Request objects.
// They represent how to make a request to a store
export type EdaApi = typeof EdaApi;

export const EdaApi = {
  getStudy(studyId: string): ApiRequest<StudyResponse> {
    return createJsonRequest({
      method: 'GET',
      path: `/studies/${studyId}`,
      transformResponse: standardTransformer(StudyResponse)
    });
  },
  getHistogram(studyId: string, entityId: string, params: HistogramRequestParams): ApiRequest<HistogramResponse> {
    return createJsonRequest({
      method: 'POST',
      path: `/studies/${studyId}/${entityId}/histogram`,
      body: JSON.stringify(params),
      transformResponse: standardTransformer(HistogramResponse)
    })
  }
  
};
