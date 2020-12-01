import { Analysis, NewAnalysis } from '../types/analysis';
import { ApiRequest, createJsonRequest, standardTransformer } from '@veupathdb/web-common/lib/util/api';
import { record, none, string } from '@veupathdb/wdk-client/lib/Utils/Json';

export type AnalysisApi = typeof AnalysisApi;

export const AnalysisApi = {
  getAnalysis(analysisId: string): ApiRequest<Analysis> {
    return createJsonRequest({
      path: `/analyses/${analysisId}`,
      method: 'GET',
      transformResponse: standardTransformer(Analysis)
    })
  },
  createAnalysis(analysis: NewAnalysis): ApiRequest<{ id: string }> {
    return createJsonRequest({
      path: `/analyses`,
      method: 'POST',
      body: analysis,
      transformResponse: standardTransformer(record({ id: string }))
    })
  },
  updateAnalysis(analysis: Analysis): ApiRequest<void> {
    return createJsonRequest({
      path: `/analyses/${analysis.id}`,
      method: 'PUT',
      body: analysis,
      transformResponse: standardTransformer(none)
    })
  },
  deleteAnalysis(analysisId: string): ApiRequest<void> {
    return createJsonRequest({
      path: `/analyses/${analysisId}`,
      method: 'DELETE',
      body: { analysisId },
      transformResponse: standardTransformer(none)
    })
  }
}
