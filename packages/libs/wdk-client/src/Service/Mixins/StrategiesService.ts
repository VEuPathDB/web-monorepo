import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { strategyDecoder, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';

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

  return { getStrategies };

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
