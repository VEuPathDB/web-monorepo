import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import {
    RecordInstance,
    PrimaryKey,
} from 'wdk-client/Utils/WdkModel';

type BasketStatusResponse = Array<boolean>;
export type BasketRecordOperation = 'add' | 'remove' ;
export type BasketStepOperation = 'addFromStepId';

export default (base: ServiceBaseClass) => class BasketsService extends base {

     /**
   * Get basket summary for all record classes
   */
  getBasketCounts() {
    return this._fetchJson<{ [recordClassName: string]: number }>('get', '/users/current/baskets');
  }

  async getBasketStatus(recordClassUrlSegment: string, records: Array<RecordInstance>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records.map(record => record.id));
    let url = `/users/current/baskets/${recordClassUrlSegment}/query`;
    return this._fetchJson<BasketStatusResponse>('post', url, data);
  }

  async getBasketStatusPk(recordClassUrlSegment: string, records: Array<PrimaryKey>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records);
    let url = `/users/current/baskets/${recordClassUrlSegment}/query`;
    return this._fetchJson<BasketStatusResponse>('post', url, data);
  }

  async updateBasketStatus(operation: BasketRecordOperation, recordClassFullName: string, primaryKey: PrimaryKey[]): Promise<void>;

  async updateBasketStatus(operation: BasketStepOperation, recordClassFullName: string, stepId: number): Promise<void>;

  async updateBasketStatus(operation: BasketRecordOperation | BasketStepOperation, recordClassUrlSegment: string, pksOrStepId: PrimaryKey[] | number): Promise<void> {
    let data = JSON.stringify({ [operation]: pksOrStepId });
    let url = `/users/current/baskets/${recordClassUrlSegment}`;
    return this._fetchJson<void>('patch', url, data);
  }


}