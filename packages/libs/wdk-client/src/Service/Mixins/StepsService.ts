import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { StandardReportConfig, Answer, Identifier, FilterValueArray, SearchConfig } from 'wdk-client/Utils/WdkModel';
import {  NewStepSpec, PatchStepSpec, Step, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import { AnswerFormatting } from './SearchReportsService';
import {submitAsForm} from 'wdk-client/Utils/FormSubmitter';

export default (base: ServiceBase) => {

  function findStep(stepId: number, userId: string = "current"): Promise<Step> {
    return base._fetchJson<Step>('get', `/users/${userId}/steps/${stepId}`);
  }

  function updateStepProperties(stepId: number, stepSpec: PatchStepSpec, userId: string = 'current'): Promise<void> {
    let data = JSON.stringify(stepSpec);
    let url = `/users/${userId}/steps/${stepId}`;
    return base._fetchJson<void>('patch', url, data);
  }

  function createStep(newStepSpec: NewStepSpec, userId: string = "current") {
    return base._fetchJson<Identifier>('post', `/users/${userId}/steps`, JSON.stringify(newStepSpec));
  }

  function getStepCustomReport(stepId: number, formatting: AnswerFormatting, userId: string = 'current'): Promise<any> {
    let reportConfig = formatting.formatConfig;
    return base.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/reports/${formatting.format}`,
      body: JSON.stringify({ reportConfig })
    });
  }

  // get step's answer in wdk default json output format
  // TODO:  use a proper decoder to ensure correct decoding of the Answer
  function getStepStandardReport(stepId: number, reportConfig: StandardReportConfig, viewFilters: FilterValueArray | undefined, userId: string = 'current'): Promise<Answer> {
    return base.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/reports/standard`,
      body: JSON.stringify({ reportConfig, viewFilters })
    });
  }

  async function downloadStepReport(stepId: number, formatting: AnswerFormatting, target = '_blank',  userId: string = 'current'): Promise<void> {
    submitAsForm({
      method: 'post',
      action: base.serviceUrl + `/users/${userId}/steps/${stepId}/reports/${formatting.format}`,
      target,
      inputs: {
        data: JSON.stringify({ reportConfig: formatting.formatConfig })
      }
    });
  }

  // get column reporter answer for the passed step
  function getStepColumnReport(
      stepId: number,
      columnName: string,
      toolName: string,
      reportConfig: object,
      userId: string = 'current') : Promise<any> {
    return base.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/columns/${columnName}/reports/${toolName}`,
      body: JSON.stringify({ reportConfig })
    });
  }

  // step filters are dynamically typed, so have to pass in the expected type
  function getStepFilterSummary<T>(
    decoder: Decode.Decoder<T>,
    stepId: number,
    filterName: string,
    userId: string = 'current'
  ) {
    return base.sendRequest(decoder, {
      method: 'get',
      path: `/users/${userId}/steps/${stepId}/filter-summary/${filterName}`
    })
  }

  function deleteStep(stepId: number, userId: string = "current"): void {
    base._fetchJson<void>('delete', `/users/${userId}/steps/${stepId}`);
  }

  function updateStepSearchConfig(stepId: number, answerSpec: SearchConfig, userId: string = "current") {
    return base._fetchJson<void>('put', `/users/${userId}/steps/${stepId}/search-config`, JSON.stringify(answerSpec));
  }

  return {
    findStep,
    updateStepProperties,
    createStep,
    getStepCustomReport,
    getStepStandardReport,
    getStepColumnReport,
    getStepFilterSummary,
    deleteStep,
    updateStepSearchConfig,
    downloadStepReport
  }

}
