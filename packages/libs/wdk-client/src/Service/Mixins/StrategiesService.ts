import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { strategyDecoder, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import { NewStrategySpec, Identifier } from 'wdk-client/Utils/WdkModel';

// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
  format: string
  formatConfig?: object
}

export default (base: ServiceBase) => {


  function getStrategies() {
    return base.sendRequest(Decode.arrayOf(strategyDecoder), {
      method: 'GET',
      path: '/users/current/strategies'
    })
  }

  function createStrategy(newStepSpec: NewStrategySpec, userId: string = "current") {
    return base._fetchJson<Identifier>('post', `/users/${userId}/steps`, JSON.stringify(newStepSpec));
}

  return { 
    getStrategies,
    createStrategy,
   };

  /*
  create
  duplicate
  delete multiple
  get
  update props
  delete
  put step-tree
  duplicated step-tree
  */

}
