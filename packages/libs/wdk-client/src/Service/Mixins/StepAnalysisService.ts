import { ServiceBase, CLIENT_WDK_VERSION_HEADER } from 'wdk-client/Service/ServiceBase';
import * as Decode from 'wdk-client/Utils/Json';
import { stepAnalysisDecoder, stepAnalysisConfigDecoder, stepAnalysisTypeDecoder, stepAnalysisStatusDecoder, FormParams } from 'wdk-client/Utils/StepAnalysisUtils';
import { parametersDecoder } from 'wdk-client/Service/Mixins/SearchesService';

export default (base: ServiceBase) => {
  function getStepAnalysisTypes(stepId: number) {
    return base.sendRequest(
      Decode.arrayOf(stepAnalysisTypeDecoder),
      {
        path: `/users/current/steps/${stepId}/analysis-types`,
        method: 'GET'
      }
    );
  }

  async function getStepAnalysisTypeParamSpecs(stepId: number, analysisTypeName: string) {
    const paramRefs = await base.sendRequest(
      parametersDecoder,
      {
        path: `/users/current/steps/${stepId}/analysis-types/${analysisTypeName}`,
        method: 'GET'
      }
    );

    return paramRefs.filter(({ isVisible }) => isVisible);
  }

  function getAppliedStepAnalyses(stepId: number) {
    return base.sendRequest(
      Decode.arrayOf(stepAnalysisDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses`,
        method: 'GET'
      }
    );
  }

  function createStepAnalysis(stepId: number, analysisConfig: { displayName?: string, analysisName: string }) {
    return base.sendRequest(
      stepAnalysisConfigDecoder,
      {
        path: `/users/current/steps/${stepId}/analyses`,
        method: 'POST',
        body: JSON.stringify(analysisConfig)
      }
    );
  }

  function deleteStepAnalysis(stepId: number, analysisId: number) {
    return base._fetchJson<void>(
      'DELETE',
      `/users/current/steps/${stepId}/analyses/${analysisId}`
    );
  }

  function getStepAnalysis(stepId: number, analysisId: number) {
    return base.sendRequest(
      stepAnalysisConfigDecoder,
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}`,
        method: 'GET'
      }
    )
  }

  function updateStepAnalysisForm(stepId: number, analysisId: number, formParams: FormParams) {
    return fetch(`${base.serviceUrl}/users/current/steps/${stepId}/analyses/${analysisId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        formParams
      }),
      credentials: 'include',
      headers: new Headers(Object.assign({
        'Content-Type': 'application/json'
      }, base._version && {
        [CLIENT_WDK_VERSION_HEADER]: base._version
      }))
    })
      .then(response => response.ok ? '[]' : response.text())
      .then(validationErrors => {
        return JSON.parse(validationErrors);
      }) as Promise<string[]>;
  }

  function renameStepAnalysis(stepId: number, analysisId: number, displayName: string) {
    return base._fetchJson<void>(
      'PATCH',
      `/users/current/steps/${stepId}/analyses/${analysisId}`,
      JSON.stringify({
        displayName
      })
    );
  }

  function runStepAnalysis(stepId: number, analysisId: number) {
    return base.sendRequest(
      Decode.field('status', stepAnalysisStatusDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
        method: 'POST'
      }
    );
  }

  function getStepAnalysisResult(stepId: number, analysisId: number) {
    return base.sendRequest(
      Decode.ok,
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
        method: 'GET'
      }
    );
  }

  function getStepAnalysisStatus(stepId: number, analysisId: number) {
    return base.sendRequest(
      Decode.field('status', stepAnalysisStatusDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result/status`,
        method: 'GET'
      }
    );
  }

  return {
    createStepAnalysis,
    deleteStepAnalysis,
    getAppliedStepAnalyses,
    getStepAnalysis,
    getStepAnalysisResult,
    getStepAnalysisStatus,
    getStepAnalysisTypeParamSpecs,
    getStepAnalysisTypes,
    renameStepAnalysis,
    runStepAnalysis,
    updateStepAnalysisForm
  }
}