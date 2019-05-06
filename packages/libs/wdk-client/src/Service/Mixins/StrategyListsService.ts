import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { strategyDecoder, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import * as QueryString from 'querystring';

// Legacy, for backward compatibility of client code with older service API
export interface AnswerFormatting {
  format: string
  formatConfig?: object
}

export default (base: ServiceBase) => {

  function getPublicStrategies(queryParams?: { userEmail: QueryString.ParsedUrlQuery[string] }) {
    const queryString = queryParams == null ? '' : '?' + QueryString.stringify(queryParams);
    return base.sendRequest(Decode.arrayOf(strategyDecoder), {
      method: 'GET',
      path: `/strategy-lists/public${queryString}`
    })
  }

  return {
    getPublicStrategies
  }
}