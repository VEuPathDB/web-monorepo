import { SECURITY_AGREEMENT_STATUS_CHANGED } from 'ebrc-client/actioncreators/GalaxyTermsActionCreators';

const initialState = {
  securityAgreementStatus: false
};

export const key = 'galaxyTerms';

export function reduce(state = initialState, { type, payload }) {
  switch(type) {
    case SECURITY_AGREEMENT_STATUS_CHANGED: return Object.assign({}, state, {
      securityAgreementStatus: payload.status
    });
    default: return state;
  }
}
