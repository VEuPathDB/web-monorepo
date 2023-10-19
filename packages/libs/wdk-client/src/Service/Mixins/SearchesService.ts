import { ServiceBase } from '../../Service/ServiceBase';
import {
  ParameterValue,
  ParameterValues,
  QuestionWithParameters,
} from '../../Utils/WdkModel';
import { OntologyTermSummary } from '../../Components/AttributeFilter/Types';
import {
  questionWithParametersDecoder,
  parametersDecoder,
} from '../Decoders/QuestionDecoders';

export default (base: ServiceBase) => {
  async function getQuestionAndParameters(
    questionUrlSegment: string
  ): Promise<QuestionWithParameters> {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base
      .sendRequest(questionWithParametersDecoder, {
        method: 'get',
        path: searchPath,
        params: {
          expandParams: 'true',
        },
        useCache: true,
        checkCachedValue: (response) =>
          response.searchData != null && response.searchData.isCacheable,
      })
      .then((response) => response.searchData);
  }

  /**
   * Fetch question information (e.g. vocabularies) given the passed param values; never cached
   */
  async function getQuestionGivenParameters(
    questionUrlSegment: string,
    paramValues: ParameterValues
  ): Promise<QuestionWithParameters> {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base
      .sendRequest(questionWithParametersDecoder, {
        method: 'post',
        path: searchPath,
        body: JSON.stringify({ contextParamValues: paramValues }),
      })
      .then((response) => response.searchData);
  }

  async function getRefreshedDependentParams(
    questionUrlSegment: string,
    paramName: string,
    paramValue: ParameterValue,
    paramValues: ParameterValues
  ) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base.sendRequest(parametersDecoder, {
      method: 'post',
      path: `${searchPath}/refreshed-dependent-params`,
      body: JSON.stringify({
        changedParam: { name: paramName, value: paramValue },
        contextParamValues: paramValues,
      }),
    });
  }

  async function getSearchPathFromUrlSegment(
    questionUrlSegment: string
  ): Promise<string> {
    const question = await base.findQuestion(questionUrlSegment);
    const recordClass = await base.findRecordClass(
      question.outputRecordClassName
    );
    return base.getSearchPath(recordClass.urlSegment, questionUrlSegment);
  }

  async function getOntologyTermSummary(
    questionUrlSegment: string,
    paramName: string,
    filters: any,
    ontologyId: string,
    paramValues: ParameterValues
  ) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base._fetchJson<OntologyTermSummary>(
      'post',
      `${searchPath}/${paramName}/ontology-term-summary`,
      JSON.stringify({
        ontologyId,
        filters,
        contextParamValues: paramValues,
      })
    );
  }

  async function getFilterParamSummaryCounts(
    questionUrlSegment: string,
    paramName: string,
    filters: any,
    paramValues: ParameterValues
  ) {
    let searchPath = await getSearchPathFromUrlSegment(questionUrlSegment);
    return base._fetchJson<{
      filtered: number;
      unfiltered: number;
      nativeFiltered: number;
      nativeUnfiltered: number;
    }>(
      'post',
      `${searchPath}/${paramName}/summary-counts`,
      JSON.stringify({
        filters,
        contextParamValues: paramValues,
      })
    );
  }

  return {
    getQuestionAndParameters,
    getQuestionGivenParameters,
    getRefreshedDependentParams,
    getOntologyTermSummary,
    getFilterParamSummaryCounts,
  };
};
