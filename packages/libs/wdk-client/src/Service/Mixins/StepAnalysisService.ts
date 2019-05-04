import { ServiceBaseClass, CLIENT_WDK_VERSION_HEADER } from 'wdk-client/Service/ServiceBase';
import * as Decode from 'wdk-client/Utils/Json';
import { stepAnalysisDecoder, stepAnalysisConfigDecoder, stepAnalysisTypeDecoder, stepAnalysisStatusDecoder, FormParams } from 'wdk-client/Utils/StepAnalysisUtils';
import { parametersDecoder } from 'wdk-client/Service/Mixins/SearchesService';

export default (base: ServiceBaseClass) => class DatasetsService extends base {
    getStepAnalysisTypes(stepId: number) {
        return this.sendRequest(
          Decode.arrayOf(stepAnalysisTypeDecoder),
          {
            path: `/users/current/steps/${stepId}/analysis-types`,
            method: 'GET'
          }
        );
      }
    
      async getStepAnalysisTypeParamSpecs(stepId: number, analysisTypeName: string) {
        const paramRefs = await this.sendRequest(
          parametersDecoder,
          {
            path: `/users/current/steps/${stepId}/analysis-types/${analysisTypeName}`,
            method: 'GET'
          }
        );
    
        return paramRefs.filter(({ isVisible }) => isVisible);
      }
    
      getAppliedStepAnalyses(stepId: number) {
        return this.sendRequest(
          Decode.arrayOf(stepAnalysisDecoder),
          {
            path: `/users/current/steps/${stepId}/analyses`,
            method: 'GET'
          }
        );
      }
    
      createStepAnalysis(stepId: number, analysisConfig: { displayName?: string, analysisName: string }) {
        return this.sendRequest(
          stepAnalysisConfigDecoder,
          {
            path: `/users/current/steps/${stepId}/analyses`,
            method: 'POST',
            body: JSON.stringify(analysisConfig)
          }
        );
      }
    
      deleteStepAnalysis(stepId: number, analysisId: number) {
        return this._fetchJson<void>(
          'DELETE',
          `/users/current/steps/${stepId}/analyses/${analysisId}`
        );
      }
    
      getStepAnalysis(stepId: number, analysisId: number) {
        return this.sendRequest(
          stepAnalysisConfigDecoder,
          {
            path: `/users/current/steps/${stepId}/analyses/${analysisId}`,
            method: 'GET'
          }
        )
      }
    
      updateStepAnalysisForm(stepId: number, analysisId: number, formParams: FormParams) {
        return fetch(`${this.serviceUrl}/users/current/steps/${stepId}/analyses/${analysisId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            formParams
          }),
          credentials: 'include',
          headers: new Headers(Object.assign({
            'Content-Type': 'application/json'
          }, this._version && {
            [CLIENT_WDK_VERSION_HEADER]: this._version
          }))
        })
          .then(response => response.ok ? '[]' : response.text())
          .then(validationErrors => {
            return JSON.parse(validationErrors);
          }) as Promise<string[]>;
      }
    
      renameStepAnalysis(stepId: number, analysisId: number, displayName: string) {
        return this._fetchJson<void>(
          'PATCH',
          `/users/current/steps/${stepId}/analyses/${analysisId}`,
          JSON.stringify({
            displayName
          })
        );
      }
    
      runStepAnalysis(stepId: number, analysisId: number) {
        return this.sendRequest(
          Decode.field('status', stepAnalysisStatusDecoder),
          {
            path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
            method: 'POST'
          }
        );
      }
    
      getStepAnalysisResult(stepId: number, analysisId: number) {
        return this.sendRequest(
          Decode.ok,
          {
            path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
            method: 'GET'
          }
        );
      }
    
      getStepAnalysisStatus(stepId: number, analysisId: number) {
        return this.sendRequest(
          Decode.field('status', stepAnalysisStatusDecoder),
          {
            path: `/users/current/steps/${stepId}/analyses/${analysisId}/result/status`,
            method: 'GET'
          }
        );
      }
}