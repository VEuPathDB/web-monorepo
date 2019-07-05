import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import {
    RecordInstance,
    PrimaryKey,
} from 'wdk-client/Utils/WdkModel';

type BasketStatusResponse = Array<boolean>;
export type BasketRecordOperation = 'add' | 'remove' ;
export type BasketStepOperation = 'addFromStepId';

export default (base: ServiceBase) => {

     /**
   * Get basket summary for all record classes
   */
  function getBasketCounts() {
    return base._fetchJson<{ [recordClassName: string]: number }>('get', '/users/current/baskets');
  }

  async function getBasketStatus(recordClassUrlSegment: string, records: Array<RecordInstance>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records.map(record => record.id));
    let url = `/users/current/baskets/${recordClassUrlSegment}/query`;
    return base._fetchJson<BasketStatusResponse>('post', url, data);
  }

  async function getBasketStatusPk(recordClassUrlSegment: string, records: Array<PrimaryKey>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records);
    let url = `/users/current/baskets/${recordClassUrlSegment}/query`;
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
    let url = `/users/current/baskets/${recordClassUrlSegment}`;
    return base._fetchJson<void>('patch', url, data);
  }

  return {
    getBasketCounts,
    getBasketStatus,
    getBasketStatusPk,
    updateBasketStatus
  }

}