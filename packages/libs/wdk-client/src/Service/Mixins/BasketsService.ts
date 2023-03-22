import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import {
    RecordInstance,
    PrimaryKey,
    Answer,
    StandardReportConfig,
    FilterValueArray,
} from 'wdk-client/Utils/WdkModel';
import {AnswerFormatting} from 'wdk-client/Service/Mixins/SearchReportsService';
import {submitAsForm} from 'wdk-client/Utils/FormSubmitter';

type BasketStatusResponse = Array<boolean>;
export type BasketPatchIdsOperation = 'add' | 'remove';

const BASKETS_PATH = '/users/current/baskets';

export default (base: ServiceBase) => {

     /**
   * Get basket summary for all record classes
   */
  function getBasketCounts() {
    return base._fetchJson<{ [recordClassName: string]: number }>('get', '/users/current/baskets');
  }

  async function getBasketStatus(recordClassUrlSegment: string, records: Array<RecordInstance>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records.map(record => record.id));
    let url = `${BASKETS_PATH}/${recordClassUrlSegment}/query`;
    return base._fetchJson<BasketStatusResponse>('post', url, data);
  }

  async function getBasketStatusPk(recordClassUrlSegment: string, records: Array<PrimaryKey>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records);
    let url = `${BASKETS_PATH}/${recordClassUrlSegment}/query`;
    return base._fetchJson<BasketStatusResponse>('post', url, data);
  }

  async function updateRecordsBasketStatus(operation: BasketPatchIdsOperation, recordClassUrlSegment: string, primaryKey: PrimaryKey[]): Promise<void> {
    return performBasketStatusPatch(recordClassUrlSegment, {
      action: operation,
      primaryKeys: primaryKey
    });
  }

  async function clearBasket(recordClassUrlSegment: string): Promise<void> {
    return performBasketStatusPatch(recordClassUrlSegment, { action: "removeAll" });
  }

  async function addStepToBasket(recordClassUrlSegment: string, stepId: number): Promise<void> {
    return performBasketStatusPatch(recordClassUrlSegment, {
      action: "addFromStepId",
      stepId: stepId
    });
  }

  function performBasketStatusPatch(recordClassUrlSegment: string, patchData: any): Promise<void> {
    let url = `${BASKETS_PATH}/${recordClassUrlSegment}`;
    return base._fetchJson<void>('patch', url, JSON.stringify(patchData));
  }

  async function getBasketCustomReport<T>(basketName: string, formatting: AnswerFormatting): Promise<T> {
    const { format, formatConfig: reportConfig } = formatting;
    const url = `${BASKETS_PATH}/${basketName}/reports/${format}`;
    const body = JSON.stringify({ reportConfig });
    return base._fetchJson<T>('post', url, body);
  }

  async function getBasketStandardReport(basketName: string, reportConfig: StandardReportConfig, viewFilters?: FilterValueArray): Promise<Answer> {
    const url = `${BASKETS_PATH}/${basketName}/reports/standard`;
    const body = JSON.stringify({ reportConfig, viewFilters });
    return base._fetchJson<Answer>('post', url, body);
  }

  async function downloadBasketReport(basketName: string, formatting: AnswerFormatting, target = '_blank'): Promise<void> {
    submitAsForm({
      method: 'post',
      action: base.serviceUrl + `${BASKETS_PATH}/${basketName}/reports/${formatting.format}`,
      target,
      inputs: {
        data: JSON.stringify({ reportConfig: formatting.formatConfig })
      }
    });
  }

  return {
    getBasketCounts,
    getBasketStatus,
    getBasketStatusPk,
    updateRecordsBasketStatus,
    clearBasket,
    addStepToBasket,
    getBasketCustomReport,
    getBasketStandardReport,
    downloadBasketReport
  }

}
