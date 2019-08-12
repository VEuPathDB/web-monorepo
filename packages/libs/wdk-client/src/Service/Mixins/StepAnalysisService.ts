import { ServiceBase, CLIENT_WDK_VERSION_HEADER } from 'wdk-client/Service/ServiceBase';
import * as Decode from 'wdk-client/Utils/Json';
import { stepAnalysisDecoder, stepAnalysisConfigDecoder, stepAnalysisTypeDecoder, stepAnalysisStatusDecoder, FormParams, StepAnalysisType, StepAnalysisConfig } from 'wdk-client/Utils/StepAnalysisUtils';
import { parametersDecoder } from 'wdk-client/Service/Mixins/SearchesService';
import { Parameter, ParameterValues } from 'wdk-client/Utils/WdkModel';

export type StepAnalysisWithParameters = StepAnalysisType & {
  parameters: Parameter[];
}

export type StepAnalysisWithValidatedParameters = {
  searchData: StepAnalysisWithParameters;
  validation: any; // FIXME: use actual type here
}

export type StepAnalysisConfigWithDisplayParams = StepAnalysisConfig & {
  displayParams: Parameter[];
}

const stepAnalysisWithParametersDecoder: Decode.Decoder<StepAnalysisWithValidatedParameters> =
  Decode.combine(
    Decode.field('searchData', Decode.combine(
      stepAnalysisTypeDecoder,
      Decode.field('parameters', parametersDecoder)
    )),
    Decode.field('validation', Decode.ok)
  )


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

  async function getStepAnalysisTypeParamSpecs(stepId: number, analysisTypeName: string): Promise<Parameter[]> {
    const paramRefs = await base.sendRequest(
      stepAnalysisWithParametersDecoder,
      {
        path: `/users/current/steps/${stepId}/analysis-types/${analysisTypeName}`,
        method: 'GET'
      }
    );
    return paramRefs.searchData.parameters;
  }

  async function getStepAnalysisTypeParamSpecsWithGivenParameters(
      stepId: number, analysisTypeName: string, paramValues: ParameterValues): Promise<Parameter[]> {
    let searchPath = `/users/current/steps/${stepId}/analysis-types/${analysisTypeName}`;
    return base.sendRequest(stepAnalysisWithParametersDecoder, {
      method: 'post',
      path: searchPath,
      body: JSON.stringify({ contextParamValues: paramValues })
    }).then(response => response.searchData.parameters);
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

  function getStepAnalysis(stepId: number, analysisId: number) : Promise<StepAnalysisConfigWithDisplayParams> {
    return base.sendRequest(
      stepAnalysisConfigDecoder,
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}`,
        method: 'GET'
      }
    ).then(stepAnalysisConfig => {
      return getStepAnalysisTypeParamSpecsWithGivenParameters(
        stepId, stepAnalysisConfig.analysisName, stepAnalysisConfig.formParams)
      .then(displayParams => ({
        ...stepAnalysisConfig,
        displayParams
      }));
    })
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