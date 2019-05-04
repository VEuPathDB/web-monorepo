import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { strategyDecoder, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';

// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
    format: string
    formatConfig?: object
} 

export default (base: ServiceBaseClass) => class StrategiesService extends base {

    getStrategies() {
        return this.sendRequest(Decode.arrayOf(strategyDecoder), {
          method: 'GET',
          path: '/users/current/strategies'
        })
      }
        
}