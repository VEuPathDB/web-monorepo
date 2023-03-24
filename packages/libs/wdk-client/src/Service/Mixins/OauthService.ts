import { ServiceBase } from '../../Service/ServiceBase';

export default (base: ServiceBase) => {
  function getOauthStateToken() {
    return base._fetchJson<{ oauthStateToken: string }>(
      'get',
      '/oauth/state-token'
    );
  }

  return { getOauthStateToken };
};
