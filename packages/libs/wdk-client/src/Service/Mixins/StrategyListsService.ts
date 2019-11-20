import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { strategySummaryDecoder, } from 'wdk-client/Utils/WdkUser';
import * as Decode from 'wdk-client/Utils/Json';
import * as QueryString from 'querystring';

export default (base: ServiceBase) => {

  function getPublicStrategies(queryParams?: { userEmail: QueryString.ParsedUrlQuery[string] }) {
    const queryString = queryParams == null ? '' : '?' + QueryString.stringify(queryParams);
    return base.sendRequest(Decode.arrayOf(strategySummaryDecoder), {
      method: 'GET',
      path: `/strategy-lists/public${queryString}`
    })
  }

  return {
    getPublicStrategies,
  }
}
