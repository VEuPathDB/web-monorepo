import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';

export default (base: ServiceBaseClass) => class OauthService extends base {

    getOauthStateToken() {
        return this._fetchJson<{oauthStateToken: string}>('get', '/oauth/state-token');
      }
    
}
