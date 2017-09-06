import { WdkStore } from 'wdk-client/Stores';
import { SECURITY_AGREEMENT_STATUS_CHANGED } from '../actioncreators/GalaxyTermsActionCreators';

/** GalaxyTermsStore */
export default class GalaxyTermsStore extends WdkStore {
  handleAction(state, { type, payload }) {
    switch(type) {
      case SECURITY_AGREEMENT_STATUS_CHANGED: return Object.assign({}, state, {
        securityAgreementStatus: payload.status
      });
      default: return state;
    }
  }
}
