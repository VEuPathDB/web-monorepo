import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import {
    RecordInstance,
    PrimaryKey,
    Answer,
    StandardReportConfig,
    FilterValueArray,
} from 'wdk-client/Utils/WdkModel';
import {AnswerFormatting} from 'wdk-client/Service/Mixins/SearchReportsService';

type BasketStatusResponse = Array<boolean>;
export type BasketRecordOperation = 'add' | 'remove' ;
export type BasketStepOperation = 'addFromStepId';

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

  async function updateBasketStatus(operation: BasketRecordOperation, recordClassFullName: string, primaryKey: PrimaryKey[]): Promise<void>;
  async function updateBasketStatus(operation: BasketStepOperation, recordClassFullName: string, stepId: number): Promise<void>;
  async function updateBasketStatus(operation: BasketRecordOperation | BasketStepOperation, recordClassUrlSegment: string, pksOrStepId: PrimaryKey[] | number): Promise<void> {
    let data = JSON.stringify({
      action: operation,
      primaryKeys: pksOrStepId
    })
    // let data = JSON.stringify({ [operation]: pksOrStepId });
    let url = `${BASKETS_PATH}/${recordClassUrlSegment}`;
    return base._fetchJson<void>('patch', url, data);
  }

  async function getBasketCustomReport<T>(basketName: string, formatting: AnswerFormatting): Promise<T> {
    const { format, formatConfig: reportConfig } = formatting;
    const url = `${BASKETS_PATH}/${basketName}/reports/${format}`;
    const body = JSON.stringify({ reportConfig });
    return base._fetchJson<T>('post', url, body);
  }

  async function getBasketStandardReport(basketName: string, reportConfig: StandardReportConfig, viewFilters?: FilterValueArray): Promise<Answer> {
    const url = `${BASKETS_PATH}/${basketName}/reports/standard`;
    const body = JSON.stringify({ reportConfig });
    return base._fetchJson<Answer>('post', url, body);
  }

  return {
    getBasketCounts,
    getBasketStatus,
    getBasketStatusPk,
    updateBasketStatus,
    getBasketCustomReport,
    getBasketStandardReport,
  }

}
