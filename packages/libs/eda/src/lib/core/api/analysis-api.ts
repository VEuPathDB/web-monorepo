import { Analysis, NewAnalysis } from '../types/analysis';
import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { type, voidType, string, array } from 'io-ts';
import { ioTransformer } from './ioTransformer';
export class AnalysisClient extends FetchClient {
  getAnalysiss(): Promise<Analysis[]> {
    return this.fetch(
      createJsonRequest({
        path: '/analysiss',
        method: 'GET',
        transformResponse: ioTransformer(array(Analysis)),
      })
    );
  }
  getAnalysis(analysisId: string): Promise<Analysis> {
    return this.fetch(
      createJsonRequest({
        path: `/analysiss/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  createAnalysis(analysis: NewAnalysis): Promise<{ id: string }> {
    return this.fetch(
      createJsonRequest({
        path: `/analysiss`,
        method: 'POST',
        body: analysis,
        transformResponse: ioTransformer(type({ id: string })),
      })
    );
  }
  updateAnalysis(analysis: Analysis): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analysiss/${analysis.id}`,
        method: 'PUT',
        body: analysis,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteAnalysis(analysisId: string): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analysiss/${analysisId}`,
        method: 'DELETE',
        body: { analysisId },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}
