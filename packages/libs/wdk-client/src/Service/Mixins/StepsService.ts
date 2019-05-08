import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { StandardReportConfig, AnswerSpec, Answer, Identifier, } from 'wdk-client/Utils/WdkModel';
import {  NewStepSpec, PatchStepSpec, Step, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import { AnswerFormatting } from './SearchReportsService';

export default (base: ServiceBase) => {

  const stepMap = new Map<number, Promise<Step>>();

  function findStep(stepId: number, userId: string = "current"): Promise<Step> {
    // cache step resonse
    if (!stepMap.has(stepId)) {
      stepMap.set(stepId, base._fetchJson<Step>('get', `/users/${userId}/steps/${stepId}`).catch(error => {
        // if the request fails, remove the response since a later request might succeed
        stepMap.delete(stepId);
        throw error;
      }))
    }
    return stepMap.get(stepId)!;
  }

  function updateStep(stepId: number, stepSpec: PatchStepSpec, userId: string = 'current'): Promise<Step> {
    let data = JSON.stringify(stepSpec);
    let url = `/users/${userId}/steps/${stepId}`;
    stepMap.set(stepId, base._fetchJson<Step>('patch', url, data).catch(error => {
      // if the request fails, remove the response since a later request might succeed
      stepMap.delete(stepId);
      throw error;
    }));
    return stepMap.get(stepId)!;
  }

  function createStep(newStepSpec: NewStepSpec, userId: string = "current") {
    return base._fetchJson<Identifier>('post', `/users/${userId}/steps`, JSON.stringify(newStepSpec));
  }

  function getStepCustomReport(stepId: number, formatting: AnswerFormatting, userId: string = 'current'): Promise<any> {
    let reportConfing = formatting.formatConfig;

    return base.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/reports/${formatting.format}`,
      body: JSON.stringify(reportConfing)
    });
  }

  // get step's answer in wdk default json output format
  // TODO:  use a proper decoder to ensure correct decoding of the Answer
  function getStepStandardReport(stepId: number, reportConfig: StandardReportConfig, userId: string = 'current'): Promise<Answer> {
    return base.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/reports/standard`,
      body: JSON.stringify(reportConfig)
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
      path: `/users/${userId}/steps/${stepId}/answer/filter-summary/${filterName}`
    })
  }

  function deleteStep(stepId: number, userId: string = "current"): void {
    if (stepMap.has(stepId)) stepMap.delete(stepId); 
    base._fetchJson<void>('delete', `/users/${userId}/steps/${stepId}`);
  }

  function updateStepSearchConfig(stepId: number, answerSpec: AnswerSpec, userId: string = "current") {
    return base._fetchJson<Step>('put', `/users/${userId}/steps/${stepId}/search-config`, JSON.stringify(answerSpec));
  }

  return {
    findStep,
    updateStep,
    createStep,
    getStepAnswer: getStepCustomReport,
    getStepAnswerJson: getStepStandardReport,
    getStepFilterSummary,
    deleteStep,
    updateStepSearchConfig
  }

}
